import type { Project } from '../types/project'
import { localizeProject } from '../i18n/translations'
import { useLocale } from '../i18n/useLocale'

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

export default function ProjectCard({ project, index }: Props) {
  const { locale, messages } = useLocale()
  const displayProject = localizeProject(project, locale)
  const vClass = visualClass[project.slug] ?? 'visual-ai'
  const vLabel = messages.work.visualLabels[
    project.slug as keyof typeof messages.work.visualLabels
  ] ?? ''
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
        <p className="project-type">{displayProject.projectType}</p>
        <h3>{displayProject.title}</h3>
        <p className="project-desc">{displayProject.description}</p>
        <div className="project-footer">
          <div className="tag-list" aria-label={messages.common.technologies}>
            {displayProject.tags.map((tag) => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
          <a
            className="project-link"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.common.viewProject.replace('{title}', displayProject.title)}
          >
            ↗
          </a>
        </div>
      </div>
    </article>
  )
}
