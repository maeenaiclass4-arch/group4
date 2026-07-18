import type { PromptSession } from './types'

const HISTORY_KEY = 'prompt-composer:history'
const LANG_KEY = 'prompt-composer:lang'
const THEME_KEY = 'prompt-composer:theme'

export function loadHistory(): PromptSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(sessions: PromptSession[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
  } catch {
    // storage unavailable or full — ignore silently
  }
}

export function loadLang(): 'ar' | 'en' | null {
  const v = localStorage.getItem(LANG_KEY)
  return v === 'ar' || v === 'en' ? v : null
}

export function saveLang(lang: 'ar' | 'en'): void {
  localStorage.setItem(LANG_KEY, lang)
}

export function loadTheme(): 'dark' | 'light' | null {
  const v = localStorage.getItem(THEME_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme)
}
