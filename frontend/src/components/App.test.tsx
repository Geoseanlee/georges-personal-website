import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Stub the hook so we never need a real API in unit tests
vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({ projects: [], loading: false, error: null }),
}))

import App from '../App'

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
})
