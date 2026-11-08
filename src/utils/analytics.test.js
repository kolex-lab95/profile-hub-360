import { describe, expect, it } from 'vitest'
import { matchScore, studentMetrics } from './analytics'

describe('studentMetrics', () => {
  const projects = [
    { id: 'a', ownerId: 'student', published: true, title: 'A' },
    { id: 'b', ownerId: 'student', published: false, title: 'B' },
    { id: 'c', ownerId: 'other', published: true, title: 'C' },
  ]
  const views = [
    { studentId: 'student', projectId: null, viewerId: 'r1', viewedAt: '2026-10-05T09:00:00.000Z' },
    { studentId: 'student', projectId: 'a', viewerId: 'r1', viewedAt: '2026-10-12T09:00:00.000Z' },
    { studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2026-10-28T09:00:00.000Z' },
  ]

  it('distinguishes profile, project and unique recruiter views', () => {
    const result = studentMetrics(views, projects, 'student')
    expect(result.published).toBe(1)
    expect(result.profileViews).toBe(1)
    expect(result.projectViews).toBe(2)
    expect(result.uniqueRecruiters).toBe(2)
    expect(result.byProject[0]).toMatchObject({ id: 'a', views: 2 })
  })
})

describe('matchScore', () => {
  const student = { name: 'Amel N’Diaye', title: 'Frontend developer', bio: 'Interfaces accessibles', skills: ['React', 'Tailwind CSS'] }
  it('matches a query and exact selected technology together', () => {
    expect(matchScore(student, 'frontend', 'React')).toBe(true)
    expect(matchScore(student, 'frontend', 'Python')).toBe(false)
    expect(matchScore(student, 'data', '')).toBe(false)
  })
})
