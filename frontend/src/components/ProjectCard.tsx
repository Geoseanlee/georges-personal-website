import type { Project } from '../types/project'

interface Props {
  project: Project
  index: number
}

const visualClass: Record<string, string> = {
  'blotz-task-app':           'visual-blotz',
  'renopilot':                'visual-reno',
  'global-youth-sdgs-summit': 'visual-sdgs',
  'ai-health-management':     'visual-ai',
}

const visualLabel: Record<string, string> = {
  'blotz-task-app':           'Product & Mobile',
  'renopilot':                'Web Platform',
  'global-youth-sdgs-summit': 'Community & Content',
  'ai-health-management':     'Digital Health',
}

export default function ProjectCard({ project, index }: Props) {
  const vClass = visualClass[project.slug] ?? 'visual-ai'
  const vLabel = visualLabel[project.slug] ?? ''
  const num    = String(index + 1).padStart(2, '0')

  return (
    <article className="project-card">
      <div className={`project-visual ${vClass}`} aria-hidden="true">
        <span className="visual-label">{vLabel}</span>
        <div className="visual-ring visual-ring-3" />
        <div className="visual-ring visual-ring-2" />
        <div className="visual-ring visual-ring-1" />
        {project.slug === 'blotz-task-app' && (
          <div className="visual-phone">
            <div className="p-bar" />
            <div className="p-bar" />
            <div className="p-bar" />
          </div>
        )}
        {project.slug !== 'blotz-task-app' && <div className="visual-dot" />}
        <span className="visual-number">{num}</span>
      </div>

      <div className="project-info">
        <p className="project-type">{project.projectType}</p>
        <h3>{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-footer">
          <div className="tag-list" aria-label="Technologies">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
          <a
            className="project-link"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.title} on GitHub`}
          >
            ↗
          </a>
        </div>
      </div>
    </article>
  )
}
