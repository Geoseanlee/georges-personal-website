const CURRENT_YEAR = new Date().getFullYear()

export default function SiteFooter() {
  return (
    <footer className="site-footer wrap">
      <a className="wordmark" href="#home" aria-label="Back to top">
        GL<em>.</em>
      </a>
      <p>Made with care, on the lands of the Yugambeh people.</p>
      <p>© {CURRENT_YEAR} George Li</p>
    </footer>
  )
}
