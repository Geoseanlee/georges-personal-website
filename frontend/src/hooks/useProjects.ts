import { useEffect, useState } from 'react'
import type { Project } from '../types/project'
import { fetchProjects } from '../data/projectsApi'
import { SAMPLE_PROJECTS } from '../test/fixtures/projects'

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // No API configured — use static fixture data for local dev / preview
    if (!API_BASE) {
      setProjects(SAMPLE_PROJECTS)
      setLoading(false)
      return
    }

    const controller = new AbortController()

    fetchProjects(API_BASE, controller.signal)
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError('Could not load projects right now.')
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { projects, loading, error }
}
