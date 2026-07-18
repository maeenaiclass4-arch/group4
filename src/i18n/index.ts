import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'has-language';

function getInitialLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through to default.
  }
  return 'ar';
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export function applyDocumentDirection(lang: string) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore persistence failures
  }
}

applyDocumentDirection(i18n.language);

i18n.on('languageChanged', (lang) => {
  applyDocumentDirection(lang);
});

export default i18n;
