import type { Project } from '../types/project'
import ProjectCard from './ProjectCard'
import { useLocale } from '../i18n/useLocale'

interface Props {
  projects: Project[]
  loading: boolean
  error: string | null
}

function SkeletonCards() {
  return (
    <>
      <div className="skeleton skeleton-card" style={{ gridColumn: '1 / -1' }} aria-hidden="true" />
      <div className="skeleton skeleton-card" aria-hidden="true" />
      <div className="skeleton skeleton-card" aria-hidden="true" />
    </>
  )
}

export default function WorkSection({ projects, loading, error }: Props) {
  const { messages } = useLocale()

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work-header">
          <h2 id="work-title">{messages.work.heading}</h2>
          <p>{messages.work.introduction}</p>
        </div>

        <div className="project-grid">
          {loading && <SkeletonCards />}

          {!loading && error && (
            <div className="work-state">
              <p>
                {messages.work.unavailable} {messages.work.checkBack}{' '}
                <a href="https://github.com/Geoseanlee" target="_blank" rel="noopener noreferrer">
                  {messages.work.browseGithub}
                </a>
                .
              </p>
            </div>
          )}

          {!loading && !error && projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <a
          className="work-more"
          href="https://github.com/Geoseanlee"
          target="_blank"
          rel="noopener noreferrer"
        >
          {messages.work.more} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}
