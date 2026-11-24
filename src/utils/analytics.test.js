import { describe, expect, it } from 'vitest'
import { dailyVisibility, matchScore, recentStudentActivity, relativeDate, relativeDateFr, studentMetrics, topProjectsByViews, validStudentViews } from './analytics'

const users = [
  { id: 'student', role: 'student', name: 'Élise Martin', avatar: 'ÉM', accent: 'coral' },
  { id: 'r1', role: 'recruiter', name: 'Ana Ruiz', avatar: 'AR', accent: 'blue' },
  { id: 'r2', role: 'recruiter', name: 'Noé Bernard', avatar: 'NB', accent: 'jade' },
  { id: 'r3', role: 'recruiter', name: 'Sarah Lemoine', avatar: 'SL', accent: 'coral' },
  { id: 'r4', role: 'recruiter', name: 'Maya Chen', avatar: 'MC', accent: 'blue' },
  { id: 'r5', role: 'recruiter', name: 'Victor Martin', avatar: 'VM', accent: 'jade' },
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

  it('excludes orphaned, anonymous, self, student, draft and unrelated project views from every student metric', () => {
    const invalidAndValidViews = [
      { id: 'identified', studentId: 'student', viewerId: 'r1', viewedAt: '2026-05-10T10:00:00.000Z' },
      { id: 'orphaned', studentId: 'student', viewerId: 'missing-recruiter', viewedAt: '2026-05-10T10:01:00.000Z' },
      { id: 'anonymous', studentId: 'student', viewerId: null, viewedAt: '2026-05-10T10:02:00.000Z' },
      { id: 'self', studentId: 'student', viewerId: 'student', viewedAt: '2026-05-10T10:03:00.000Z' },
      { id: 'student-viewer', studentId: 'student', viewerId: 'other-student', viewedAt: '2026-05-10T10:04:00.000Z' },
      { id: 'draft', studentId: 'student', projectId: 'b', viewerId: 'r1', viewedAt: '2026-05-10T10:05:00.000Z' },
      { id: 'unrelated-project', studentId: 'student', projectId: 'c', viewerId: 'r1', viewedAt: '2026-05-10T10:06:00.000Z' },
    ]
    const options = { now: '2026-05-10T12:00:00.000Z', users, timeZone: 'UTC' }
    const metrics = studentMetrics(invalidAndValidViews, projects, 'student', options)
    const daily = dailyVisibility(invalidAndValidViews, projects, 'student', options)
    const activity = recentStudentActivity(invalidAndValidViews, projects, 'student', options)

    expect(validStudentViews(invalidAndValidViews, projects, 'student', options).map((view) => view.id)).toEqual(['identified'])
    expect(metrics.validViews.map((view) => view.id)).toEqual(['identified'])
    expect(metrics).toMatchObject({ profileViews: 1, projectViews: 0, uniqueRecruiters: 1 })
    expect(metrics.byProject.find((project) => project.id === 'a')?.views).toBe(0)
    expect(daily.reduce((total, day) => total + day.total, 0)).toBe(1)
    expect(activity.map((item) => item.id)).toEqual(['identified'])
    expect(activity[0].visitorName).toBe('Ana Ruiz')
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
  it('orders tied projects stably and returns at most the top five projects', () => {
    const manyProjects = ['Zeste', 'Atlas', 'Brume', 'Écho', 'Delta', 'Faro'].map((title, index) => ({ id: `p${index}`, ownerId: 'student', published: true, title, category: 'Application web' }))
    const views = manyProjects.flatMap((project, index) => Array.from({ length: index % 2 ? 1 : 2 }, (_, occurrence) => ({ id: `${project.id}-${occurrence}`, studentId: 'student', projectId: project.id, viewerId: occurrence ? 'r2' : 'r1', viewedAt: '2026-05-10T10:00:00.000Z' })))
    const ranked = studentMetrics(views, manyProjects, 'student', { now: '2026-05-10T12:00:00.000Z', users, timeZone: 'UTC' }).byProject
    expect(ranked.map((project) => project.title)).toEqual(['Brume', 'Delta', 'Zeste', 'Atlas', 'Écho', 'Faro'])
    expect(topProjectsByViews(ranked).map((project) => project.title)).toEqual(['Brume', 'Delta', 'Zeste', 'Atlas', 'Écho'])
  })

  it('handles one, three, five and more than five projects without fabricating a ranking', () => {
    const makeProject = (index, views) => ({ id: `p${index}`, title: `Projet ${index}`, views })
    expect(topProjectsByViews([makeProject(1, 3)])).toHaveLength(1)
    expect(topProjectsByViews([makeProject(1, 3), makeProject(2, 2), makeProject(3, 1)])).toHaveLength(3)
    expect(topProjectsByViews([1, 2, 3, 4, 5].map((index) => makeProject(index, index)))).toHaveLength(5)
    expect(topProjectsByViews([1, 2, 3, 4, 5, 6].map((index) => makeProject(index, index))).map((project) => project.id)).toEqual(['p6', 'p5', 'p4', 'p3', 'p2'])
    expect(topProjectsByViews([makeProject(1, 0), makeProject(2, 0), makeProject(3, 0)]).map((project) => project.views)).toEqual([0, 0, 0])
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
    expect(activity.map((item) => item.id)).toEqual(['same-recruiter-later', 'project', 'profile', 'old'])
    expect(activity[0]).toMatchObject({ visitorName: 'Ana Ruiz', type: 'project', projectTitle: 'Atlas', relativeDate: 'Il y a 10 minutes' })
    expect(activity.every((item) => item.visitorName !== 'Visiteur non identifié')).toBe(true)
    expect(activity[2]).toMatchObject({ type: 'profile', projectTitle: null })
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

  it('uses English relative time and date labels when requested', () => {
    const now = '2026-05-10T12:00:00.000Z'
    expect(relativeDate('2026-05-10T11:55:00.000Z', now, { timeZone: 'UTC', locale: 'en-US' })).toBe('5 minutes ago')
    expect(relativeDate('2026-05-09T12:00:00.000Z', now, { timeZone: 'UTC', locale: 'en-US' })).toBe('Yesterday')
    expect(relativeDate('2026-05-01T12:00:00.000Z', now, { timeZone: 'UTC', locale: 'en-US' })).toBe('May 1, 2026')
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
