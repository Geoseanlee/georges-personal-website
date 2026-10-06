import { useLocale } from '../i18n/useLocale'

export default function ContactSection() {
  const { messages } = useLocale()

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner wrap">
        <p className="section-tag">{messages.contact.tag}</p>
        <h2 id="contact-title">{messages.contact.heading}</h2>
        <p className="contact-sub">{messages.contact.introduction}</p>
        <a
          className="btn btn-primary"
          href="mailto:geoseanlee@gmail.com"
        >
          {messages.contact.writeNote} <span aria-hidden="true">↗</span>
        </a>

        <div className="contact-links">
          <a href="https://www.linkedin.com/in/george-li-o4a0eo49b9/" target="_blank" rel="noopener noreferrer">
            {messages.common.linkedin} <span aria-hidden="true">↗</span>
          </a>
          <a href="https://www.instagram.com/geoseanlee/?hl=en" target="_blank" rel="noopener noreferrer">
            {messages.common.instagram} <span aria-hidden="true">↗</span>
          </a>
          <a href="https://github.com/Geoseanlee" target="_blank" rel="noopener noreferrer">
            {messages.common.github} <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:geoseanlee@gmail.com">
            geoseanlee@gmail.com <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
