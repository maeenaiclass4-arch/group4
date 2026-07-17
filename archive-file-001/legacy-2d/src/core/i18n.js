import en from '../data/strings/en.json';
import ar from '../data/strings/ar.json';

/**
 * i18n.js
 * Tiny lookup helper — every UI string in the codebase routes through
 * t(key), never a hardcoded literal (GDD §14). Adding a third language is
 * a matter of dropping in strings/<lang>.json and registering it below —
 * no component changes required.
 *
 * This module only tracks *which* language is active and sets the
 * document-level lang/dir attributes; it does not re-render anything.
 * Live re-render on a language change is main.js's job (EVENTS.LANGUAGE_CHANGED)
 * — see SettingsPanel's language selector.
 */
const DICTIONARIES = { en, ar };

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = DICTIONARIES[lang] ? lang : 'en';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
}

export function getLanguage() {
  return currentLang;
}

/**
 * @param {string} key dot-free flat key, e.g. "menu.newArchive"
 * @returns {string|string[]} the string (or array, for the loading ticker) — falls back to the key itself so a missing translation is visibly obvious rather than blank.
 */
export function t(key) {
  const dict = DICTIONARIES[currentLang] ?? DICTIONARIES.en;
  return dict[key] ?? key;
}
