import { useLocale } from '../i18n/useLocale'

function CyclingIllustration() {
  return (
    <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <circle cx="63" cy="105" r="29" />
      <circle cx="178" cy="105" r="29" />
      <path d="m63 105 42-57 32 57H63l26-37h39m-18-20h20m-7 0 25 57m-25-57 12-8" />
      <path d="M98 32a13 13 0 1 1 0 26 13 13 0 0 1 0-26Z" />
    </svg>
  )
}

function TaipeiIllustration() {
  return (
    <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <path d="M0 125h240M18 125V82h26v43m7 0V60h30v65m8 0V90h20v35m6 0V35h36v90m7 0V73h27v52m8 0V52h34v73" />
      <path d="M99 35h36m-30-12h24m-12-12v12m-7 24h10m-10 13h10m-10 13h10m-10 13h10m-10 13h10m-66-30h12m-12 13h12m-12 13h12m91-5h11m-11 13h11m-11 13h11m21-54h14m-14 13h14m-14 13h14m-14 13h14" />
    </svg>
  )
}

export default function AboutSection() {
  const { messages } = useLocale()

  return (
    <section className="about section" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="about-grid">
          <div>
            <p className="section-tag">{messages.about.tag}</p>
            <h2 id="about-title">{messages.about.heading}</h2>
          </div>
          <div className="about-body">
            {messages.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

            <article className="faith-card">
              <p className="faith-card-label">{messages.about.faithTitle}</p>
              <p>{messages.about.faithText}</p>
            </article>

            <div className="story-visual-grid">
              <figure className="story-visual-card">
                <div className="story-visual-art cycling-art" role="img" aria-label={messages.about.cyclingAlt}>
                  <CyclingIllustration />
                  <span>{messages.about.cyclingPlaceholder}</span>
                </div>
                <figcaption>
                  <strong>{messages.about.cyclingTitle}</strong>
                  <span>{messages.about.cyclingText}</span>
                  <small>{messages.about.replaceImage}</small>
                </figcaption>
              </figure>
              <figure className="story-visual-card">
                <div className="story-visual-art taipei-art" role="img" aria-label={messages.about.taipeiAlt}>
                  <TaipeiIllustration />
                  <span>{messages.about.taipeiPlaceholder}</span>
                </div>
                <figcaption>
                  <strong>{messages.about.taipeiTitle}</strong>
                  <span>{messages.about.taipeiText}</span>
                  <small>{messages.about.replaceImage}</small>
                </figcaption>
              </figure>
            </div>

            <div className="lang-grid" aria-label={messages.about.languages}>
              {messages.about.languageList.map(({ name, level }) => (
                <div className="lang-item" key={name}>
                  <span className="lang-name">{name}</span>
                  <span className="lang-level">
                    {messages.about.proficiency[level as keyof typeof messages.about.proficiency]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
