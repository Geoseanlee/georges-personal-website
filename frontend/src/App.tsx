import SiteHeader from './components/SiteHeader'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import WorkSection from './components/WorkSection'
import JourneySection from './components/JourneySection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'
import { useProjects } from './hooks/useProjects'
import { LocaleProvider } from './i18n/LocaleProvider'
import { useLocale } from './i18n/useLocale'

function PortfolioPage() {
  const { projects, loading, error } = useProjects()
  const { messages } = useLocale()

  return (
    <>
      <a className="skip-link" href="#main">{messages.common.skipLink}</a>
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <WorkSection projects={projects} loading={loading} error={error} />
        <JourneySection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}

export default function App() {
  return (
    <LocaleProvider>
      <PortfolioPage />
    </LocaleProvider>
  )
}
