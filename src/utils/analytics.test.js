import { describe, expect, it } from 'vitest'
import { dailyVisibility, matchScore, recentStudentActivity, relativeDateFr, studentMetrics } from './analytics'

const users = [
  { id: 'student', role: 'student', name: 'Élise Martin', avatar: 'ÉM', accent: 'coral' },
  { id: 'r1', role: 'recruiter', name: 'Ana Ruiz', avatar: 'AR', accent: 'blue' },
  { id: 'r2', role: 'recruiter', name: 'Noé Bernard', avatar: 'NB', accent: 'jade' },
  { id: 'other-student', role: 'student', name: 'Autre étudiant' },
]

const projects = [
  { id: 'a', ownerId: 'student', published: true, title: 'Atlas', category: 'Application web' },
  { id: 'b', ownerId: 'student', published: false, title: 'Brouillon', category: 'Civic tech' },
  { id: 'c', ownerId: 'other', published: true, title: 'Chez les autres', category: 'Produit mobile' },
]

describe('studentMetrics', () => {
  const views = [
    { studentId: 'student', projectId: null, viewerId: 'r1', viewedAt: '2026-10-05T09:00:00.000Z' },
    { studentId: 'student', projectId: 'a', viewerId: 'r1', viewedAt: '2026-10-12T09:00:00.000Z' },
    { studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2026-10-28T09:00:00.000Z' },
  ]

  it('distinguishes profile, project and unique recruiter views', () => {
    const result = studentMetrics(views, projects, 'student', { now: '2026-11-02T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(result.published).toBe(1)
    expect(result.profileViews).toBe(1)
    expect(result.projectViews).toBe(2)
    expect(result.uniqueRecruiters).toBe(2)
    expect(result.byProject[0]).toMatchObject({ id: 'a', views: 2 })
  })

  it('keeps historical weekly trends separate from daily visibility', () => {
    const periodViews = [
      { studentId: 'student', projectId: null, viewerId: 'r1', viewedAt: '2026-10-05T09:00:00.000Z' },
      { studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2026-10-12T09:00:00.000Z' },
      { studentId: 'student', projectId: null, viewerId: 'r3', viewedAt: '2026-10-19T09:00:00.000Z' },
      { studentId: 'student', projectId: 'a', viewerId: 'r4', viewedAt: '2026-10-26T09:00:00.000Z' },
      { studentId: 'student', projectId: 'other-project', viewerId: 'r5', viewedAt: '2026-10-28T09:00:00.000Z' },
      { studentId: 'student', projectId: null, viewerId: 'student', viewedAt: '2026-10-29T09:00:00.000Z' },
    ]
    const result = studentMetrics(periodViews, projects, 'student', { now: '2026-11-01T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(result.weekly.map((week) => week.total)).toEqual([1, 1, 1, 1])
    expect(result.weeklyTotal).toBe(4)
    expect(result.dailyTotal).toBe(2)
    expect(result.uniqueRecruiters).toBe(4)
    expect(result.topProject?.id).toBe('a')
  })

  it('returns a neutral trend when two comparable periods contain no views', () => {
    const result = studentMetrics([], projects, 'student', { now: '2026-11-02T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(result.profileTrend).toBe('—')
    expect(result.projectTrend).toBe('—')
    expect(result.topProject).toBeNull()
  })
})

describe('dailyVisibility', () => {
  it('uses exactly the fourteen calendar days ending today across a year boundary', () => {
    const views = [
      { id: 'start', studentId: 'student', viewerId: 'r1', viewedAt: '2025-12-21T08:00:00.000Z' },
      { id: 'new-year', studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2025-12-31T09:00:00.000Z' },
      { id: 'jan-1', studentId: 'student', viewerId: 'r1', viewedAt: '2026-01-01T09:00:00.000Z' },
      { id: 'jan-3a', studentId: 'student', viewerId: 'r1', viewedAt: '2026-01-03T08:00:00.000Z' },
      { id: 'jan-3b', studentId: 'student', projectId: 'a', viewerId: 'r2', viewedAt: '2026-01-03T09:00:00.000Z' },
      { id: 'duplicate', studentId: 'student', viewerId: 'r2', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'duplicate', studentId: 'student', viewerId: 'r2', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'self', studentId: 'student', viewerId: 'student', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'student-viewer', studentId: 'student', viewerId: 'other-student', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'draft', studentId: 'student', projectId: 'b', viewerId: 'r1', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'other-owner', studentId: 'student', projectId: 'c', viewerId: 'r1', viewedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'outside', studentId: 'student', viewerId: 'r1', viewedAt: '2025-12-20T10:00:00.000Z' },
      { id: 'future', studentId: 'student', viewerId: 'r1', viewedAt: '2026-01-04T10:00:00.000Z' },
    ]
    const days = dailyVisibility(views, projects, 'student', { now: '2026-01-03T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(days).toHaveLength(14)
    expect(days[0].key).toBe('2025-12-21')
    expect(days.at(-1).key).toBe('2026-01-03')
    expect(days.map((day) => day.total).filter(Boolean)).toEqual([1, 1, 1, 3])
    expect(days.reduce((total, day) => total + day.total, 0)).toBe(6)
  })

  it('crosses leap days and daylight-saving calendar changes without dropping a day', () => {
    const leap = dailyVisibility([{ id: 'leap', studentId: 'student', viewerId: 'r1', viewedAt: '2024-02-29T12:00:00.000Z' }], projects, 'student', { now: '2024-03-01T12:00:00.000Z', users, timeZone: 'UTC' })
    const dst = dailyVisibility([{ id: 'dst', studentId: 'student', viewerId: 'r1', viewedAt: '2026-03-29T01:30:00.000Z' }], projects, 'student', { now: '2026-03-30T12:00:00.000Z', users, timeZone: 'Europe/Paris' })
    expect(leap.map((day) => day.key)).toContain('2024-02-29')
    expect(leap).toHaveLength(14)
    expect(dst.map((day) => day.key)).toEqual(['2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30'])
    expect(dst.find((day) => day.key === '2026-03-29')?.total).toBe(1)
  })

  it('rolls forward one calendar day, dropping only the expired day', () => {
    const views = [
      { id: 'expired', studentId: 'student', viewerId: 'r1', viewedAt: '2026-04-27T10:00:00.000Z' },
      { id: 'new', studentId: 'student', viewerId: 'r2', viewedAt: '2026-05-11T10:00:00.000Z' },
    ]
    const before = dailyVisibility(views, projects, 'student', { now: '2026-05-10T12:00:00.000Z', users, timeZone: 'UTC' })
    const after = dailyVisibility(views, projects, 'student', { now: '2026-05-11T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(before[0].key).toBe('2026-04-27')
    expect(before.reduce((sum, day) => sum + day.total, 0)).toBe(1)
    expect(after[0].key).toBe('2026-04-28')
    expect(after.reduce((sum, day) => sum + day.total, 0)).toBe(1)
  })
})

describe('project ranking and recent activity', () => {
  it('orders tied projects stably and lets the screen take only the first four', () => {
    const manyProjects = ['Zeste', 'Atlas', 'Brume', 'Écho', 'Delta'].map((title, index) => ({ id: `p${index}`, ownerId: 'student', published: true, title, category: 'Application web' }))
    const views = manyProjects.flatMap((project, index) => Array.from({ length: index % 2 ? 1 : 2 }, (_, occurrence) => ({ id: `${project.id}-${occurrence}`, studentId: 'student', projectId: project.id, viewerId: occurrence ? 'r2' : 'r1', viewedAt: '2026-05-10T10:00:00.000Z' })))
    const ranked = studentMetrics(views, manyProjects, 'student', { now: '2026-05-10T12:00:00.000Z', users, timeZone: 'UTC' }).byProject
    expect(ranked.map((project) => project.title)).toEqual(['Brume', 'Delta', 'Zeste', 'Atlas', 'Écho'])
    expect(ranked.slice(0, 4)).toHaveLength(4)
  })

  it('exposes the latest five valid events with real visitor data and distinct visits', () => {
    const views = [
      { id: 'old', studentId: 'student', viewerId: 'r1', viewedAt: '2026-05-08T09:00:00.000Z' },
      { id: 'profile', studentId: 'student', viewerId: 'r2', viewedAt: '2026-05-10T10:00:00.000Z' },
      { id: 'project', studentId: 'student', projectId: 'a', viewerId: 'r1', viewedAt: '2026-05-10T11:00:00.000Z' },
      { id: 'unknown', studentId: 'student', viewerId: 'missing', viewedAt: '2026-05-10T11:30:00.000Z' },
      { id: 'self', studentId: 'student', viewerId: 'student', viewedAt: '2026-05-10T11:45:00.000Z' },
      { id: 'draft', studentId: 'student', projectId: 'b', viewerId: 'r1', viewedAt: '2026-05-10T11:45:00.000Z' },
      { id: 'same-recruiter-later', studentId: 'student', projectId: 'a', viewerId: 'r1', viewedAt: '2026-05-10T11:50:00.000Z' },
    ]
    const activity = recentStudentActivity(views, projects, 'student', { now: '2026-05-10T12:00:00.000Z', users, timeZone: 'UTC' })
    expect(activity.map((item) => item.id)).toEqual(['same-recruiter-later', 'unknown', 'project', 'profile', 'old'])
    expect(activity[0]).toMatchObject({ visitorName: 'Ana Ruiz', type: 'project', projectTitle: 'Atlas', relativeDate: 'Il y a 10 minutes' })
    expect(activity[1].visitorName).toBe('Visiteur non identifié')
    expect(activity[3]).toMatchObject({ type: 'profile', projectTitle: null })
  })

  it('formats short and old activity dates in French without a dashboard reload', () => {
    const now = '2026-05-10T12:00:00.000Z'
    expect(relativeDateFr('2026-05-10T11:59:00.000Z', now, { timeZone: 'UTC' })).toBe('À l’instant')
    expect(relativeDateFr('2026-05-10T11:55:00.000Z', now, { timeZone: 'UTC' })).toBe('Il y a 5 minutes')
    expect(relativeDateFr('2026-05-10T08:00:00.000Z', now, { timeZone: 'UTC' })).toBe('Il y a 4 heures')
    expect(relativeDateFr('2026-05-09T12:00:00.000Z', now, { timeZone: 'UTC' })).toBe('Hier')
    expect(relativeDateFr('2026-05-05T12:00:00.000Z', now, { timeZone: 'UTC' })).toBe('Il y a 5 jours')
    expect(relativeDateFr('2026-05-01T12:00:00.000Z', now, { timeZone: 'UTC' })).toBe('1 mai 2026')
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
