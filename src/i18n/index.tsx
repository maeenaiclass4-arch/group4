import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../lib/types'
import { loadLang, saveLang } from '../lib/storage'
import { translations } from './translations'

interface I18nContextValue {
  lang: Lang
  dir: 'rtl' | 'ltr'
  t: typeof translations.ar
  toggleLang: () => void
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang() ?? 'ar')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    saveLang(lang)
  }, [lang])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      t: translations[lang],
      toggleLang: () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar')),
      setLang: setLangState,
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
