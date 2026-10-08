import { useSyncExternalStore } from 'react';
import messages from './messages.en.json';
import { getLanguage, getLanguagePreference, subscribeLanguage } from './languageStore';
export { apiFetch, chooseLanguage, getLanguage, getLocale, initializeLanguage } from './languageStore';
export type { Language } from './languageStore';
const english: Record<string, string> = messages;
type Parameters = Record<string, string | number | undefined>;

export const useLanguage = () => useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
export const useLanguagePreference = () => useSyncExternalStore(subscribeLanguage, getLanguagePreference, getLanguagePreference);
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(english).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => {
  const slots: string[] = [];
  let cursor = 0, pattern = '';
  for (const match of key.matchAll(/\{(\d+)\}/g)) {
    pattern += escape(key.slice(cursor, match.index)) + '([\\s\\S]*?)';
    slots.push(match[1]); cursor = match.index! + match[0].length;
  }
  return { regex: new RegExp('^' + pattern + escape(key.slice(cursor)) + '$'), slots, value };
});

export function t(key: string, parameters?: Parameters): string {
  let result = getLanguage() === 'en' ? english[key] || key : key;
  if (parameters) result = result.replace(/\{([^{}]+)\}/g, (match, slot) => String(parameters[slot] ?? match));
  return result;
}
// API errors may include interpolated paths or counts. Translate their message,
// without applying translations to user-authored cards or website metadata.
export function translateMessage(message: string): string {
  if (getLanguage() !== 'en') return message;
  if (english[message]) return english[message];
  for (const { regex, slots, value } of patterns) {
    const match = message.match(regex);
    if (match) return value.replace(/\{(\d+)\}/g, (_, slot) => match[slots.indexOf(slot) + 1] ?? '');
  }
  return message;
}
