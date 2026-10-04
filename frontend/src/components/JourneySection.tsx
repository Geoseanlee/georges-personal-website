const items = [
  {
    date: '2026 — 2028',
    title: 'Master of Nursing',
    place: 'Southern Cross University',
    location: 'Gold Coast, Australia',
    note: 'In Progress',
    current: true,
  },
  {
    date: '2026 — Now',
    title: 'Support Worker & Dog Groomer',
    place: 'Mable · Touch of Pawfection',
    location: 'Gold Coast',
    note: 'People & Animals',
    current: true,
  },
  {
    date: '2024 — 2025',
    title: 'Master of Computer Science',
    place: 'The University of Sydney',
    location: 'Sydney, Australia',
    note: 'Distinction',
    current: false,
  },
  {
    date: '2019 — 2023',
    title: 'Bachelor of Arts, Economics',
    place: 'Soochow University',
    location: 'Taiwan',
    note: 'High Distinction',
    current: false,
  },
]

export default function JourneySection() {
  return (
    <section className="section" id="journey" aria-labelledby="journey-title" style={{ background: 'var(--bg-alt)' }}>
      <div className="wrap">
        <p className="section-tag">The journey so far</p>
        <h2 id="journey-title" className="journey-h2" style={{ fontWeight: 800, letterSpacing: '-0.04em', fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', marginBlockEnd: 'var(--sp-12)' }}>
          Still becoming.
        </h2>

        <div className="journey-inner">
          {items.map((item) => (
            <div className="tl-item" key={item.title + item.date}>
              <div className="tl-left">
                <p className="tl-year">{item.date}</p>
                <div className="tl-line" />
              </div>
              <div className={`tl-right${item.current ? ' tl-current' : ''}`}>
                <div className="tl-dot-row">
                  <div className="tl-dot" />
                  {item.note && (
                    <span className="tl-badge">{item.note}</span>
                  )}
                </div>
                <p className="tl-year-mobile">{item.date}</p>
                <h3>{item.title}</h3>
                <p>
                  {item.place}{' '}
                  <span>· {item.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
