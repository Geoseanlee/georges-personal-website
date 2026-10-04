import type { Project } from '../types/project'

export async function fetchProjects(
  baseUrl: string,
  signal?: AbortSignal,
): Promise<Project[]> {
  const res = await fetch(`${baseUrl}/api/v1/projects`, { signal })

  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }

  const data: unknown = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('Invalid response shape from /api/v1/projects')
  }

  return data as Project[]
}
