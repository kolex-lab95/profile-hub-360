export function conversationPartner(conversation, currentUserId, users) {
  const partnerId = conversation.participantIds.find((id) => id !== currentUserId)
  return users.find((user) => user.id === partnerId)
}

export function messagesForConversation(messages, conversationId) {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export function unreadMessages(messages, userId, conversationId) {
  return messages.filter((message) => (
    (!conversationId || message.conversationId === conversationId)
    && message.senderId !== userId
    && !(message.readBy || []).includes(userId)
  ))
}

export function unreadCount(messages, userId, conversationId) {
  return unreadMessages(messages, userId, conversationId).length
}

export function directConversation(conversations, firstUserId, secondUserId) {
  return conversations.find((conversation) => (
    conversation.participantIds.length === 2
    && conversation.participantIds.includes(firstUserId)
    && conversation.participantIds.includes(secondUserId)
  ))
}
