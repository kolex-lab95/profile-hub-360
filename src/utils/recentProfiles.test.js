import { describe, expect, it } from 'vitest'
import { distinctRecentProfiles } from './recentProfiles'

describe('distinctRecentProfiles', () => {
  it('keeps the newest visit per student and sorts distinct profiles', () => {
    const events = [
      { recruiterId: 'r', studentId: 'amel', viewedAt: '2026-11-01T09:00:00.000Z' },
      { recruiterId: 'r', studentId: 'yann', viewedAt: '2026-11-02T09:00:00.000Z' },
      { recruiterId: 'r', studentId: 'amel', viewedAt: '2026-11-04T09:00:00.000Z' },
      { recruiterId: 'other', studentId: 'sarah', viewedAt: '2026-11-05T09:00:00.000Z' },
    ]
    expect(distinctRecentProfiles(events, 'r').map((event) => event.studentId)).toEqual(['amel', 'yann'])
  })

  it('supports progressive rendering of a large history without duplicates', () => {
    const events = Array.from({ length: 25 }, (_, index) => ({ recruiterId: 'r', studentId: `student-${index}`, viewedAt: `2026-11-${String(index + 1).padStart(2, '0')}T09:00:00.000Z` }))
    const unique = distinctRecentProfiles(events, 'r')
    expect(unique).toHaveLength(25)
    expect(unique.slice(0, 5)).toHaveLength(5)
    expect(new Set(unique.map((event) => event.studentId)).size).toBe(25)
  })
})
