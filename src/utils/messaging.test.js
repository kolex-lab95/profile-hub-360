import { describe, expect, it } from 'vitest'
import { directConversation, unreadCount, unreadMessages } from './messaging'

describe('messaging helpers', () => {
  const messages = [
    { id: 'm1', conversationId: 'c1', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'm2', conversationId: 'c1', senderId: 'student', readBy: ['student', 'recruiter'] },
    { id: 'm3', conversationId: 'c2', senderId: 'recruiter', readBy: ['recruiter'] },
  ]

  it('counts only persisted unread incoming messages', () => {
    expect(unreadCount(messages, 'student')).toBe(2)
    expect(unreadCount(messages, 'student', 'c1')).toBe(1)
    expect(unreadMessages(messages, 'student', 'c1')).toHaveLength(1)
  })

  it('reuses an existing direct conversation between participants', () => {
    const conversations = [{ id: 'c1', participantIds: ['student', 'recruiter'] }]
    expect(directConversation(conversations, 'recruiter', 'student')?.id).toBe('c1')
  })
})
