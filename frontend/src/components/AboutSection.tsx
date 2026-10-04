const languages = [
  { name: 'Mandarin', level: 'Native' },
  { name: 'English',  level: 'Fluent' },
  { name: 'Japanese', level: 'Learning' },
  { name: 'German',   level: 'Learning' },
]

export default function AboutSection() {
  return (
    <section className="about section" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="about-grid">
          <div>
            <p className="section-tag">The person</p>
            <h2 id="about-title">
              Different paths.<br />
              <em>One human focus.</em>
            </h2>
          </div>
          <div className="about-body">
            <p>
              My path has moved from economics to software, and now into nursing.
              Each step has taught me something different about how people make
              decisions, solve problems, and support one another.
            </p>
            <p>
              I completed a Master of Computer Science at the University of
              Sydney with Distinction, and I'm now studying a Master of Nursing
              at Southern Cross University. I bring a builder's curiosity and a
              calm, attentive approach to the work I do.
            </p>

            <div className="lang-grid" aria-label="Languages">
              {languages.map(({ name, level }) => (
                <div className="lang-item" key={name}>
                  <span className="lang-name">{name}</span>
                  <span className="lang-level">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
