import en from '../data/strings/en.json';

/**
 * i18n.js
 * Tiny lookup helper — every UI string in the codebase routes through
 * t(key), never a hardcoded literal (GDD §14). Only "en" has authored
 * content today; adding "ar" (already planned, given the studio's
 * existing RTL work) is a matter of dropping in strings/ar.json and
 * registering it in DICTIONARIES below — no component changes required.
 */
const DICTIONARIES = { en };

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = DICTIONARIES[lang] ? lang : 'en';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
}

/**
 * @param {string} key dot-free flat key, e.g. "menu.newArchive"
 * @returns {string|string[]} the string (or array, for the loading ticker) — falls back to the key itself so a missing translation is visibly obvious rather than blank.
 */
export function t(key) {
  const dict = DICTIONARIES[currentLang] ?? DICTIONARIES.en;
  return dict[key] ?? key;
}
