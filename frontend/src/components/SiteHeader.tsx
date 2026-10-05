import { useEffect, useRef, useState } from 'react'

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [profilePhotoFailed, setProfilePhotoFailed] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

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
      <a href="#home" className="profile-avatar" aria-label="George Li, home">
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
        aria-label={open ? 'Close navigation' : 'Open navigation'}
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
        aria-label="Main navigation"
      >
        <a href="#about"   onClick={close}>About</a>
        <a href="#work"    onClick={close}>Work</a>
        <a href="#journey" onClick={close}>Journey</a>
        <a href="#contact" onClick={close} className="nav-cta">
          Say hello <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  )
}
