import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'ar') as AppLanguage;

  const toggleLanguage = () => {
    i18n.changeLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return { language, toggleLanguage, setLanguage: i18n.changeLanguage };
}
