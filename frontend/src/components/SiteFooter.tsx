import { useLocale } from '../i18n/useLocale'

const CURRENT_YEAR = new Date().getFullYear()

export default function SiteFooter() {
  const { messages } = useLocale()

  return (
    <footer className="site-footer wrap">
      <a className="wordmark" href="#home" aria-label={messages.common.backToTop}>
        GL<em>.</em>
      </a>
      <p>{messages.footer.madeWithCare}</p>
      <p>{messages.footer.copyright.replace('{year}', String(CURRENT_YEAR))}</p>
    </footer>
  )
}
