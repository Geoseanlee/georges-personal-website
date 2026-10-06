import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { localizeProject } from '../i18n/translations'
import { SAMPLE_PROJECTS } from '../test/fixtures/projects'

// Stub the hook so we never need a real API in unit tests
const mockProjects = vi.hoisted(() => [{
  id: 1,
  slug: 'blotz-task-app',
  title: 'Blotz Task App',
  projectType: 'FULL-STACK · 2025',
  year: 2025,
  description: 'A task management app.',
  tags: ['React'],
  githubUrl: 'https://github.com/sol-wizard/Blotz-Task-App',
  displayOrder: 1,
  isFeatured: true,
}])

vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({ projects: mockProjects, loading: false, error: null }),
}))

import App from '../App'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.lang = 'en'
})

describe('App smoke test', () => {
  it('renders the skip link and main landmark', () => {
    render(<App />)
    expect(screen.getByText('Skip to content')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(<App />)
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
  })

  it('shows the profile and landscape photos in their respective locations', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'George Li, home' }).querySelector('img'))
      .toHaveAttribute('src', '/images/profile-photo.jpg?v=2')
    expect(screen.getByRole('img', { name: 'George Li sitting by a cafe window' }))
      .toHaveAttribute('src', '/images/hero-photo.jpg?v=2')
  })

  it('shows a dark placeholder when the hero photo fails to load', () => {
    render(<App />)
    fireEvent.error(screen.getByRole('img', { name: 'George Li sitting by a cafe window' }))
    expect(screen.getByRole('img', { name: 'George Li portrait unavailable' }))
      .toHaveClass('hero-portrait-placeholder')
  })

  it('renders the confirmed education timeline and replaceable story visuals', () => {
    render(<App />)
    expect(screen.getByText('Completed Year 12')).toBeInTheDocument()
    expect(screen.getByText('Soochow University · Taipei, Taiwan')).toBeInTheDocument()
    expect(screen.getByText('The University of Sydney')).toBeInTheDocument()
    expect(screen.getAllByText('August 2026')).toHaveLength(2)
    expect(screen.getByRole('img', { name: /bicycle placeholder/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Taipei skyline placeholder/i })).toBeInTheDocument()
  })

  it('switches the whole page to Simplified Chinese and persists the selection', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '简体' }))

    expect(document.documentElement.lang).toBe('zh-Hans')
    expect(document.title).toContain('科技')
    expect(window.localStorage.getItem('personalweb-locale')).toBe('zh-Hans')
    expect(screen.getByRole('heading', { name: '在代码与关怀之间，继续探索。' })).toBeInTheDocument()
    expect(screen.getByText('完成高中十二年级')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Blotz 任务应用' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '简体' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('supports Traditional Chinese and restores the saved locale on remount', () => {
    const firstRender = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '繁體' }))
    expect(document.documentElement.lang).toBe('zh-Hant')
    expect(screen.getByText('完成高中十二年級')).toBeInTheDocument()
    firstRender.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: '繁體' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: '在程式與關懷之間，持續探索。' })).toBeInTheDocument()
  })

  it('defaults to dark mode, toggles the theme, and restores the saved choice', () => {
    const firstRender = render(<App />)
    const themeButton = screen.getByRole('button', { name: 'Switch to light mode' })

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(themeButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(themeButton)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('personalweb-theme')).toBe('light')
    firstRender.unmount()

    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' }))
      .toHaveAttribute('aria-pressed', 'true')
  })
})

describe('project localization', () => {
  it('translates known project slugs and preserves unknown API project copy', () => {
    expect(localizeProject(SAMPLE_PROJECTS[0], 'zh-Hans').title).toBe('Blotz 任务应用')

    const unknownProject = { ...SAMPLE_PROJECTS[0], slug: 'new-project' }
    expect(localizeProject(unknownProject, 'zh-Hant').title).toBe(unknownProject.title)
    expect(localizeProject(unknownProject, 'zh-Hant').description).toBe(unknownProject.description)
  })
})
