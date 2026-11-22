export function conversationPartner(conversation, currentUserId, users) {
  const partnerId = conversation.participantIds.find((id) => id !== currentUserId)
  return users.find((user) => user.id === partnerId)
}

export function conversationsForUser(conversations, userId) {
  return conversations.filter((conversation) => conversation.participantIds?.includes(userId))
}

export function messagesForConversation(messages, conversationId) {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export function unreadMessages(messages, conversations, userId, conversationId) {
  const accessibleConversationIds = new Set(conversationsForUser(conversations, userId).map((conversation) => conversation.id))
  return messages.filter((message) => (
    accessibleConversationIds.has(message.conversationId)
    && (!conversationId || message.conversationId === conversationId)
    && message.senderId !== userId
    && !(message.readBy || []).includes(userId)
  ))
}

export function unreadCount(messages, conversations, userId, conversationId) {
  return unreadMessages(messages, conversations, userId, conversationId).length
}

export function markConversationMessagesRead(messages, conversations, userId, conversationId) {
  const unreadIds = new Set(unreadMessages(messages, conversations, userId, conversationId).map((message) => message.id))
  return messages.map((message) => (
    unreadIds.has(message.id)
      ? { ...message, readBy: [...(message.readBy || []), userId] }
      : message
  ))
}

export function directConversation(conversations, firstUserId, secondUserId) {
  return conversations.find((conversation) => (
    conversation.participantIds?.length === 2
    && conversation.participantIds.includes(firstUserId)
    && conversation.participantIds.includes(secondUserId)
  ))
}
