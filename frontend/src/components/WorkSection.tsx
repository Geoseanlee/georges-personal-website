import type { Project } from '../types/project'
import ProjectCard from './ProjectCard'

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
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work-header">
          <h2 id="work-title">
            Things I've<br />
            <em>helped bring to life.</em>
          </h2>
          <p>
            Somewhere between a useful tool and a meaningful experience,
            there's a good project.
          </p>
        </div>

        <div className="project-grid">
          {loading && <SkeletonCards />}

          {!loading && error && (
            <div className="work-state">
              <p>
                {error} Check back soon, or{' '}
                <a href="https://github.com/Geoseanlee" target="_blank" rel="noopener noreferrer">
                  browse GitHub directly
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
          More on GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}
