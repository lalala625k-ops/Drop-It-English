import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const temporary = await mkdtemp(path.join(tmpdir(), 'dropit-language-test-'));
const output = path.join(temporary, 'language.mjs');
await build({ entryPoints: [fileURLToPath(new URL('../src/i18n/index.ts', import.meta.url))],
  bundle: true, format: 'esm', platform: 'browser', outfile: output });
after(() => rm(temporary, { recursive: true, force: true }));
const cache = new Map();
globalThis.localStorage = { getItem: key => cache.get(key), setItem: (key, value) => cache.set(key, value) };
globalThis.window = { location: { href: 'http://127.0.0.1:8800/', origin: 'http://127.0.0.1:8800' } };
globalThis.document = { documentElement: { lang: 'en' } };
let disk = { language: 'en', confirmed: false };
const calls = [];
globalThis.fetch = async (url, init = {}) => {
  calls.push({ url, init });
  if (init.method === 'POST' && url === '/api/preferences/language') disk = JSON.parse(init.body);
  return new Response(JSON.stringify(disk), { status: 200 });
};
const i18n = await import(pathToFileURL(output));

test('first use defaults to English and confirmation persists independently of board data', async () => {
  await i18n.initializeLanguage();
  assert.equal(i18n.getLanguage(), 'en');
  assert.equal(i18n.t('设置'), 'Settings');
  await i18n.chooseLanguage('zh');
  assert.deepEqual(disk, { language: 'zh', confirmed: true });
  assert.equal(i18n.t('设置'), '设置');
  assert.equal(document.documentElement.lang, 'zh-CN');
  assert.equal(calls.at(-1).url, '/api/preferences/language');
  cache.clear();
  await i18n.initializeLanguage();
  assert.equal(i18n.getLanguage(), 'zh');
  assert.deepEqual(JSON.parse([...cache.values()][0]), disk);
});
test('failed language save leaves the previous preference intact', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 500 });
  try { await assert.rejects(i18n.chooseLanguage('en')); assert.equal(i18n.getLanguage(), 'zh'); }
  finally { globalThis.fetch = previous; }
});
test('changing language keeps API content and headers intact and leaves external requests alone', async () => {
  await i18n.chooseLanguage('en');
  await i18n.apiFetch('/api/cards/changes', { method: 'POST', body: 'user content', headers: { 'X-Test': 'keep' } });
  assert.equal(calls.at(-1).init.headers.get('Accept-Language'), 'en-US');
  assert.equal(calls.at(-1).init.headers.get('X-Test'), 'keep');
  assert.equal(calls.at(-1).init.body, 'user content');
  await i18n.apiFetch('https://example.com/photo.jpg');
  assert.equal(calls.at(-1).init.headers, undefined);
});
test('catalog preserves all interpolation slots and produces English messages without translating user text', async () => {
  const messages = JSON.parse(await readFile(new URL('../src/i18n/messages.en.json', import.meta.url), 'utf8'));
  const slots = text => [...text.matchAll(/\{(\d+)\}/g)].map(match => match[1]).sort();
  for (const [chinese, english] of Object.entries(messages)) {
    assert.deepEqual(slots(english), slots(chinese), chinese);
    assert.doesNotMatch(english, /\p{Script=Han}/u, chinese);
  }
  assert.equal(i18n.translateMessage('保存失败: disk full'), 'Save failed: disk full');
  assert.equal(i18n.translateMessage('user-authored 中文 note'), 'user-authored 中文 note');
  assert.equal(i18n.t('原点 {0}', { 0: 3 }), 'Origin 3');
});
test('browser-only use can confirm a language when the local service is unavailable', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    await i18n.initializeLanguage();
    await i18n.chooseLanguage('zh');
    assert.equal(i18n.getLanguage(), 'zh');
    assert.equal(JSON.parse([...cache.values()][0]).confirmed, true);
  } finally { globalThis.fetch = previous; }
});
