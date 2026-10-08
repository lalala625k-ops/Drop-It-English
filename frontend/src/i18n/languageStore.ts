export type Language = 'en' | 'zh';
export interface LanguagePreference { language: Language; confirmed: boolean }
const storageKey = 'dropit_english_language_v1';
const listeners = new Set<() => void>();
let preference: LanguagePreference = { language: 'en', confirmed: false };
let backendAvailable = false;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (saved && ['en', 'zh'].includes(saved.language)) {
    preference = { language: saved.language, confirmed: saved.confirmed === true };
  }
} catch { /* English is the default if storage is unavailable. */ }

export const getLanguagePreference = () => preference;
export const getLanguage = () => preference.language;
export const getLocale = () => preference.language === 'en' ? 'en-US' : 'zh-CN';
export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function acceptPreference(next: LanguagePreference) {
  preference = next;
  try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Disk preference remains authoritative. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = getLocale();
  listeners.forEach((listener) => listener());
}
export async function initializeLanguage() {
  backendAvailable = false;
  try {
    const response = await fetch('/api/preferences/language', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const result = await response.json();
    if (['en', 'zh'].includes(result.language)) {
      backendAvailable = true;
      acceptPreference({ language: result.language, confirmed: result.confirmed === true });
    }
  } catch { /* Browser-only use keeps its local preference. */ }
}
export async function chooseLanguage(language: Language) {
  if (!backendAvailable) {
    acceptPreference({ language, confirmed: true });
    return;
  }
  const response = await fetch('/api/preferences/language', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, confirmed: true }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Could not save language. Please try again.');
  acceptPreference({ language, confirmed: true });
}

// Every API request uses the current UI language, including native dialogs.
// Content URLs and requests to other origins are passed through unchanged.
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const path = input instanceof Request ? input.url : String(input);
  const url = new URL(path, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return fetch(input, init);
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  headers.set('Accept-Language', getLocale());
  return fetch(input, { ...init, headers });
}
