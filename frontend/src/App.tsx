import SiteHeader from './components/SiteHeader'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import WorkSection from './components/WorkSection'
import JourneySection from './components/JourneySection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'
import { useProjects } from './hooks/useProjects'

export default function App() {
  const { projects, loading, error } = useProjects()

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
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
