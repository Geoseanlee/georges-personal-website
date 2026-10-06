import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { localeTags, translations, type Locale } from './translations'
import { LocaleContext, type Theme } from './LocaleContext'

const supportedLocales: Locale[] = ['en', 'zh-Hans', 'zh-Hant']
const localeStorageKey = 'personalweb-locale'
const themeStorageKey = 'personalweb-theme'

function readSavedLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(localeStorageKey)
    return supportedLocales.includes(saved as Locale) ? (saved as Locale) : 'en'
  } catch (error) {
    console.warn('Could not read the saved language preference.', error)
    return 'en'
  }
}

function readSavedTheme(): Theme {
  try {
    return window.localStorage.getItem(themeStorageKey) === 'light' ? 'light' : 'dark'
  } catch (error) {
    console.warn('Could not read the saved theme preference.', error)
    return 'dark'
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readSavedLocale)
  const [theme, setTheme] = useState<Theme>(readSavedTheme)
  const setLocale = useCallback((nextLocale: Locale) => setLocaleState(nextLocale), [])
  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.lang = localeTags[locale]
    document.title = translations[locale].common.pageTitle
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = translations[locale].common.pageDescription
    try {
      window.localStorage.setItem(localeStorageKey, locale)
    } catch (error) {
      console.warn('Could not save the language preference.', error)
    }
  }, [locale])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem(themeStorageKey, theme)
    } catch (error) {
      console.warn('Could not save the theme preference.', error)
    }
  }, [theme])

  return (
    <LocaleContext.Provider value={{
      locale,
      setLocale,
      messages: translations[locale],
      theme,
      toggleTheme,
    }}>
      {children}
    </LocaleContext.Provider>
  )
}
