import { describe, expect, it } from 'vitest'
import { dashboardPathForRole, matchingAccount } from '../src/utils/authentication'
import { favoriteCountForUser } from '../src/utils/favorites'
import { conversationsForUser, unreadCount } from '../src/utils/messaging'
import { addDemoRecruiter, appendDemoRecruiter, demoRecruiter } from './ensure-demo-recruiter.mjs'

describe('demo recruiter seed', () => {
  const existingRecruiter = { id: 'recruiter-elsa', email: 'elsa@talent.demo', role: 'recruiter' }
  const baseData = {
    users: [existingRecruiter],
    favorites: [{ id: 'favorite-elsa', recruiterId: 'recruiter-elsa', targetId: 'student-amel' }],
    recentProfiles: [{ id: 'profile-elsa', recruiterId: 'recruiter-elsa', studentId: 'student-amel' }],
    views: [{ id: 'view-elsa', viewerId: 'recruiter-elsa', studentId: 'student-amel' }],
    conversations: [{ id: 'conversation-elsa', participantIds: ['recruiter-elsa', 'student-amel'] }],
    messages: [{ id: 'message-elsa', conversationId: 'conversation-elsa', senderId: 'recruiter-elsa', readBy: ['recruiter-elsa'] }],
  }

  it('adds Nadia exactly once with a recruiter account that can authenticate and reach the recruiter dashboard', () => {
    const firstRun = addDemoRecruiter(baseData)
    const nadia = matchingAccount(firstRun.data.users, ' NADIA@TALENT.DEMO ', 'demo123')
    const secondRun = addDemoRecruiter(firstRun.data)

    expect(firstRun.created).toBe(true)
    expect(nadia).toMatchObject({ ...demoRecruiter, role: 'recruiter', company: 'Horizon Talent' })
    expect(dashboardPathForRole(nadia.role)).toBe('/recruteur')
    expect(secondRun.created).toBe(false)
    expect(secondRun.data.users.filter((user) => user.id === demoRecruiter.id)).toHaveLength(1)
  })

  it('keeps all account-scoped collections empty for Nadia until she performs an action', () => {
    const { data } = addDemoRecruiter(baseData)

    expect(favoriteCountForUser(data.favorites, demoRecruiter.id)).toBe(0)
    expect(data.recentProfiles.filter((item) => item.recruiterId === demoRecruiter.id)).toEqual([])
    expect(data.views.filter((item) => item.viewerId === demoRecruiter.id)).toEqual([])
    expect(conversationsForUser(data.conversations, demoRecruiter.id)).toEqual([])
    expect(unreadCount(data.messages, data.conversations, demoRecruiter.id)).toBe(0)
  })

  it('refuses to overwrite an existing account and preserves the original JSON around the inserted user', () => {
    expect(() => addDemoRecruiter({ users: [{ id: demoRecruiter.id, email: 'other@talent.demo' }] })).toThrow('Impossible d’ajouter Nadia Faye')

    const source = '{\r\n  "users": [\r\n    { "id": "recruiter-elsa", "email": "elsa@talent.demo" }\r\n  ],\r\n  "projects": []\r\n}\r\n'
    const result = appendDemoRecruiter(source)

    expect(result.created).toBe(true)
    expect(result.source).toContain('"projects": []')
    expect(result.source).toContain('"id": "recruiter-nadia-faye"')
    expect(JSON.parse(result.source).users).toHaveLength(2)
  })
})
