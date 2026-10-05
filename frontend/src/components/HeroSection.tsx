import { useRef, useState, type PointerEvent } from 'react'

export default function HeroSection() {
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
          <p className="hero-location" aria-label="Location: Gold Coast, Australia">
            Gold Coast, Australia · Taiwan to Australia
          </p>

          <h1 id="hero-title">
            A life between<br />
            <em>code &amp; care.</em>
          </h1>

          <p className="hero-bio">
            I'm George — a nursing student with a computer science background.
            I'm drawn to work that makes everyday life a little more thoughtful,
            useful, and human.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#work">
              Explore my work <span aria-hidden="true">↓</span>
            </a>
            <a className="btn btn-ghost" href="mailto:geoseanlee@gmail.com">
              Get in touch <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="hero-socials" aria-label="Social profiles">
            <a
              href="https://www.linkedin.com/in/george-li-o4a0eo49b9/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.instagram.com/geoseanlee/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/Geoseanlee"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
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
                aria-label="George Li portrait unavailable"
              >
                GL
              </div>
            ) : (
              <img
                src="/images/hero-photo.jpg?v=2"
                alt="George Li sitting by a cafe window"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
          <figcaption>George Li · Gold Coast, Australia</figcaption>
        </figure>
      </div>
    </section>
  )
}
