import { useEffect, useRef, useState } from 'react';
import { chooseLanguage, Language, useLanguagePreference } from '../i18n';

export function LanguagePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const preference = useLanguagePreference();
  const [selected, setSelected] = useState<Language>(preference.language);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  const visible = open || !preference.confirmed;
  useEffect(() => { if (visible) { setSelected(preference.language); setError(''); selectRef.current?.focus(); } }, [visible]);
  if (!visible) return null;
  const chinese = selected === 'zh';
  const confirm = async () => {
    setBusy(true); setError('');
    try { await chooseLanguage(selected); onClose(); }
    catch { setError(chinese ? '无法保存语言，请重试。' : 'Could not save language. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div data-modal="language" className="fixed inset-0 z-[20000] bg-ink/40 flex items-center justify-center p-6"
    onMouseDown={(event) => event.stopPropagation()} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); }}
    onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key === 'Escape' && preference.confirmed && !busy) onClose();
      if (event.key === 'Tab') { const controls = event.currentTarget.querySelectorAll<HTMLElement>('select, button');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}>
    <div role="dialog" aria-modal="true" aria-labelledby="language-title" className="w-full max-w-[400px] bg-paper border-2 border-ink p-7 text-ink">
      <h1 id="language-title" className="text-xl font-bold">{chinese ? '选择语言' : 'Choose your language'}</h1>
      <p className="mt-3 text-sm leading-relaxed">{chinese ? '你可以随时在设置中更改语言。' : 'You can change this anytime in Settings.'}</p>
      <select ref={selectRef} aria-label="Language" value={selected} disabled={busy} onChange={(event) => setSelected(event.target.value as Language)}
        className="mt-5 w-full bg-paper border border-ink px-3 py-3 outline-none focus:border-2">
        <option value="en">English</option><option value="zh">中文</option>
      </select>
      {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        {preference.confirmed && <button disabled={busy} className="border border-ink px-4 py-2" onClick={onClose}>{chinese ? '取消' : 'Cancel'}</button>}
        <button disabled={busy} className="bg-ink text-paper border border-ink px-4 py-2 disabled:opacity-50" onClick={() => void confirm()}>
          {busy ? (chinese ? '保存中…' : 'Saving…') : (chinese ? '继续' : 'Continue')}
        </button>
      </div>
    </div>
  </div>;
}
