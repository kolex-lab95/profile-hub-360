import { describe, expect, it } from 'vitest'
import { directConversation, markConversationMessagesRead, unreadCount, unreadMessages } from './messaging'

describe('messaging helpers', () => {
  const conversations = [
    { id: 'c1', participantIds: ['student', 'recruiter'] },
    { id: 'c2', participantIds: ['student', 'recruiter'] },
    { id: 'c3', participantIds: ['student', 'recruiter'] },
  ]
  const messages = [
    { id: 'a1', conversationId: 'c1', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'a2', conversationId: 'c1', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'b1', conversationId: 'c2', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'c1', conversationId: 'c3', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'c2', conversationId: 'c3', senderId: 'recruiter', readBy: ['recruiter'] },
    { id: 'sent', conversationId: 'c1', senderId: 'student', readBy: ['student'] },
    { id: 'ghost', conversationId: 'not-accessible', senderId: 'recruiter', readBy: ['recruiter'] },
  ]

  it('counts five unread incoming messages only from accessible conversations', () => {
    expect(unreadCount(messages, conversations, 'student')).toBe(5)
    expect(unreadCount(messages, conversations, 'student', 'c1')).toBe(2)
    expect(unreadMessages(messages, conversations, 'student', 'c1')).toHaveLength(2)
  })

  it('reuses an existing direct conversation between participants', () => {
    expect(directConversation(conversations, 'recruiter', 'student')?.id).toBe('c1')
  })

  it('marks only the opened conversation as read and preserves the remaining total', () => {
    const afterFirstOpen = markConversationMessagesRead(messages, conversations, 'student', 'c1')
    expect(unreadCount(afterFirstOpen, conversations, 'student')).toBe(3)
    expect(unreadCount(afterFirstOpen, conversations, 'student', 'c1')).toBe(0)

    const afterSecondOpen = markConversationMessagesRead(afterFirstOpen, conversations, 'student', 'c2')
    expect(unreadCount(afterSecondOpen, conversations, 'student')).toBe(2)

    const afterLastOpen = markConversationMessagesRead(afterSecondOpen, conversations, 'student', 'c3')
    expect(unreadCount(afterLastOpen, conversations, 'student')).toBe(0)
  })

  it('does not leak notifications to an unrelated account or an empty inbox', () => {
    expect(unreadCount(messages, conversations, 'another-student')).toBe(0)
    expect(unreadCount(messages, [], 'student')).toBe(0)
  })
})
