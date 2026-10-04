export interface Project {
  id: number
  slug: string
  title: string
  projectType: string
  year: number
  description: string
  tags: string[]
  githubUrl: string
  displayOrder: number
  isFeatured: boolean
}
