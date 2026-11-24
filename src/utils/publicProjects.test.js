import { describe, expect, it } from 'vitest'
import { selectPublicProjects } from './publicProjects'

describe('selectPublicProjects', () => {
  const users = [
    { id: 'candidate', role: 'student' },
    { id: 'recruiter', role: 'recruiter' },
  ]

  it('keeps at most three published projects with a real candidate owner', () => {
    const projects = [
      { id: 'draft', title: 'Brouillon', ownerId: 'candidate', published: false, createdAt: '2026-11-10T00:00:00.000Z' },
      { id: 'missing-owner', title: 'Orphelin', ownerId: 'missing', published: true, createdAt: '2026-11-10T00:00:00.000Z' },
      { id: 'recruiter-project', title: 'Hors vitrine', ownerId: 'recruiter', published: true, createdAt: '2026-11-10T00:00:00.000Z' },
      { id: 'a', title: 'Atlas', ownerId: 'candidate', published: true, createdAt: '2026-11-01T00:00:00.000Z' },
      { id: 'b', title: 'Boussole', ownerId: 'candidate', published: true, createdAt: '2026-11-02T00:00:00.000Z' },
      { id: 'c', title: 'Cartographie', ownerId: 'candidate', published: true, createdAt: '2026-11-03T00:00:00.000Z' },
      { id: 'd', title: 'Données', ownerId: 'candidate', published: true, createdAt: '2026-11-04T00:00:00.000Z' },
    ]
    expect(selectPublicProjects(projects, users).map((project) => project.id)).toEqual(['d', 'c', 'b'])
  })

  it('uses a deterministic title and id tie-breaker and handles an empty public catalogue', () => {
    const tied = [
      { id: 'z', title: 'Atlas', ownerId: 'candidate', published: true, createdAt: '2026-11-03T00:00:00.000Z' },
      { id: 'a', title: 'Atlas', ownerId: 'candidate', published: true, createdAt: '2026-11-03T00:00:00.000Z' },
      { id: 'b', title: 'Boussole', ownerId: 'candidate', published: true, createdAt: '2026-11-03T00:00:00.000Z' },
    ]
    expect(selectPublicProjects(tied, users).map((project) => project.id)).toEqual(['a', 'z', 'b'])
    expect(selectPublicProjects([{ id: 'draft', ownerId: 'candidate', published: false }], users)).toEqual([])
  })
})
