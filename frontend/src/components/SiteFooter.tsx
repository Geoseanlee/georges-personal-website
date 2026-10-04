import { useEffect, useState } from 'react'

export default function SiteFooter() {
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="site-footer wrap">
      <a className="wordmark" href="#home" aria-label="Back to top">
        GL<em>.</em>
      </a>
      <p>Made with care, on the lands of the Yugambeh people.</p>
      <p>© {year} George Li</p>
    </footer>
  )
}
