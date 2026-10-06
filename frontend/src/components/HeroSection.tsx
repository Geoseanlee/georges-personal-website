import { useRef, useState, type PointerEvent } from 'react'
import { useLocale } from '../i18n/useLocale'

export default function HeroSection() {
  const { messages } = useLocale()
  const [portraitFailed, setPortraitFailed] = useState(false)
  const portraitFrameRef = useRef<HTMLDivElement>(null)

  const tiltPortrait = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !portraitFrameRef.current) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    portraitFrameRef.current.style.setProperty('--tilt-x', `${(x - 0.5) * 8}deg`)
    portraitFrameRef.current.style.setProperty('--tilt-y', `${(0.5 - y) * 6}deg`)
  }

  const resetPortraitTilt = () => {
    portraitFrameRef.current?.style.setProperty('--tilt-x', '0deg')
    portraitFrameRef.current?.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <section className="hero section" id="home" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-layout">
        <div className="hero-inner">
          <p className="hero-location" aria-label={messages.common.location}>
            {messages.hero.location}
          </p>

          <h1 id="hero-title">
            {messages.hero.headlineStart}<br />
            <em>{messages.hero.headlineAccent}</em>
          </h1>

          <p className="hero-bio">{messages.hero.introduction}</p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#work">
              {messages.hero.exploreWork} <span aria-hidden="true">↓</span>
            </a>
            <a className="btn btn-ghost" href="mailto:geoseanlee@gmail.com">
              {messages.hero.getInTouch} <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="hero-socials" aria-label={messages.common.socialProfiles}>
            <a
              href="https://www.linkedin.com/in/george-li-o4a0eo49b9/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {messages.common.linkedin} <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.instagram.com/geoseanlee/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              {messages.common.instagram} <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/Geoseanlee"
              target="_blank"
              rel="noopener noreferrer"
            >
              {messages.common.github} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <figure className="hero-portrait">
          <div
            ref={portraitFrameRef}
            className="hero-portrait-frame"
            onPointerMove={tiltPortrait}
            onPointerLeave={resetPortraitTilt}
          >
            {portraitFailed ? (
              <div
                className="hero-portrait-placeholder"
                role="img"
                aria-label={messages.hero.portraitUnavailable}
              >
                GL
              </div>
            ) : (
              <img
                src="/images/hero-photo.jpg?v=2"
                alt={messages.hero.portraitAlt}
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
          <figcaption>{messages.hero.caption}</figcaption>
        </figure>
      </div>
    </section>
  )
}
