export default function ContactSection() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner wrap">
        <p className="section-tag">Your turn</p>
        <h2 id="contact-title">
          Something on<br />
          your <em>mind?</em>
        </h2>
        <p className="contact-sub">
          Always open to a good conversation — about tech, care, or anything in between.
        </p>
        <a
          className="btn btn-primary"
          href="mailto:geoseanlee@gmail.com"
        >
          Write me a note <span aria-hidden="true">↗</span>
        </a>

        <div className="contact-links">
          <a href="https://www.linkedin.com/in/george-li-o4a0eo49b9/" target="_blank" rel="noopener noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href="https://www.instagram.com/geoseanlee/?hl=en" target="_blank" rel="noopener noreferrer">
            Instagram <span aria-hidden="true">↗</span>
          </a>
          <a href="https://github.com/Geoseanlee" target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:geoseanlee@gmail.com">
            geoseanlee@gmail.com <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
