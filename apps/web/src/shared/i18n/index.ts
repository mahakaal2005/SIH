import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language, Localized } from '@ys/shared'
import en from './locales/en.json'
import hi from './locales/hi.json'

export const LANGUAGES: Language[] = ['hi', 'en']

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: 'hi',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export function setDocumentLanguage(lang: Language) {
  document.documentElement.lang = lang
}

/** Picks the right side of a data-level {en, hi} pair (scheme names, districts, projects). */
export const pick = (text: Localized, lang: string): string => (lang === 'en' ? text.en : text.hi)

export default i18n
