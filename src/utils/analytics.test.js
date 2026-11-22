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
    const result = studentMetrics(views, projects, 'student', { now: '2026-11-02T12:00:00.000Z' })
    expect(result.published).toBe(1)
    expect(result.profileViews).toBe(1)
    expect(result.projectViews).toBe(2)
    expect(result.uniqueRecruiters).toBe(2)
    expect(result.byProject[0]).toMatchObject({ id: 'a', views: 2 })
  })

  it('keeps the four weekly bars and their displayed total in the same period', () => {
    const periodViews = [
      { studentId: 'student', projectId: null, viewerId: 'r1', viewedAt: '2026-10-05T09:00:00.000Z' },
      { studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2026-10-12T09:00:00.000Z' },
      { studentId: 'student', projectId: null, viewerId: 'r3', viewedAt: '2026-10-19T09:00:00.000Z' },
      { studentId: 'student', projectId: 'a', viewerId: 'r4', viewedAt: '2026-10-26T09:00:00.000Z' },
      { studentId: 'student', projectId: 'other-project', viewerId: 'r5', viewedAt: '2026-10-28T09:00:00.000Z' },
      { studentId: 'student', projectId: null, viewerId: 'student', viewedAt: '2026-10-29T09:00:00.000Z' },
    ]
    const result = studentMetrics(periodViews, projects, 'student', { now: '2026-11-01T12:00:00.000Z' })
    expect(result.weekly.map((week) => week.total)).toEqual([1, 1, 1, 1])
    expect(result.weeklyTotal).toBe(4)
    expect(result.uniqueRecruiters).toBe(4)
    expect(result.topProject?.id).toBe('a')
  })

  it('returns a neutral trend when two comparable periods contain no views', () => {
    const result = studentMetrics([], projects, 'student', { now: '2026-11-02T12:00:00.000Z' })
    expect(result.profileTrend).toBe('—')
    expect(result.projectTrend).toBe('—')
    expect(result.topProject).toBeNull()
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
