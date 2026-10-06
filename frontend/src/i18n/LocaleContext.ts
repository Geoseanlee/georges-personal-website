import { createContext } from 'react'
import type { Locale, Messages } from './translations'

export type Theme = 'dark' | 'light'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Messages
  theme: Theme
  toggleTheme: () => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
