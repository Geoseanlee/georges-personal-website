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
  const [projects, setProjects] = useState<Project[]>(API_BASE ? [] : SAMPLE_PROJECTS)
  const [loading, setLoading] = useState(Boolean(API_BASE))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!API_BASE) return

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
