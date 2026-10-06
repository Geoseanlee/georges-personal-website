import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/useLocale'
import type { Locale } from '../i18n/translations'

const localeOptions: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh-Hans', label: '简体' },
  { value: 'zh-Hant', label: '繁體' },
]

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [profilePhotoFailed, setProfilePhotoFailed] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { locale, setLocale, messages, theme, toggleTheme } = useLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <a href="#home" className="profile-avatar" aria-label={messages.common.home}>
        <span className="profile-avatar-frame">
          {profilePhotoFailed ? (
            <span aria-hidden="true">GL</span>
          ) : (
            <img
              src="/images/profile-photo.jpg?v=2"
              alt=""
              onError={() => setProfilePhotoFailed(true)}
            />
          )}
        </span>
      </a>

      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-label={open ? messages.common.closeNavigation : messages.common.openNavigation}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((p) => !p)}
      >
        <span />
        <span />
      </button>

      <nav
        ref={navRef}
        id="site-nav"
        className={`site-nav${open ? ' is-open' : ''}`}
        aria-label={messages.common.mainNavigation}
      >
        <a href="#about"   onClick={close}>{messages.common.about}</a>
        <a href="#work"    onClick={close}>{messages.common.work}</a>
        <a href="#journey" onClick={close}>{messages.common.journey}</a>
        <a href="#contact" onClick={close} className="nav-cta">
          {messages.common.sayHello} <span aria-hidden="true">↗</span>
        </a>
        <div className="language-switcher" role="group" aria-label={messages.common.language}>
          {localeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              lang={option.value}
              aria-pressed={locale === option.value}
              onClick={() => setLocale(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme === 'dark' ? messages.common.switchToLight : messages.common.switchToDark}
          aria-pressed={theme === 'light'}
          onClick={toggleTheme}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
        </button>
      </nav>
    </header>
  )
}
