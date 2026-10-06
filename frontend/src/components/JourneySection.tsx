import { useLocale } from '../i18n/useLocale'

export default function JourneySection() {
  const { messages } = useLocale()

  return (
    <section className="section" id="journey" aria-labelledby="journey-title" style={{ background: 'var(--bg-alt)' }}>
      <div className="wrap">
        <p className="section-tag">{messages.journey.tag}</p>
        <h2 id="journey-title" className="journey-h2">
          {messages.journey.heading}
        </h2>

        <div className="journey-inner">
          {messages.journey.events.map((item, index) => (
            <div className="tl-item" key={item.title + item.date}>
              <div className="tl-left">
                <p className="tl-year">{item.date}</p>
                <div className="tl-line" />
              </div>
              <div className={`tl-right${index === messages.journey.events.length - 1 ? ' tl-current' : ''}`}>
                <div className="tl-dot-row">
                  <div className="tl-dot" />
                  {index === messages.journey.events.length - 1 && (
                    <span className="tl-badge">{messages.journey.current}</span>
                  )}
                </div>
                <p className="tl-year-mobile">{item.date}</p>
                <h3>{item.title}</h3>
                <p className="tl-place">{item.place}</p>
                <p className="tl-detail">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="journey-context">
          <article>
            <h3>{messages.journey.workTitle}</h3>
            <p>{messages.journey.workDetail}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
