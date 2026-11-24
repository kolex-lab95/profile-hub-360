import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, MessageCircle, Send, X } from './icons'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../i18n/I18n'
import { api } from '../services/api'
import { conversationPartner, messagesForConversation, unreadCount } from '../utils/messaging'

function conversationDate(value, locale) {
  if (!value) return ''
  const date = new Date(value)
  const today = new Date()
  const format = date.toDateString() === today.toDateString()
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  return format.format(date)
}

export function MessagesPage() {
  const { locale } = useTranslation()
  const timeFormat = useMemo(() => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }), [locale])
  const dayFormat = useMemo(() => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }), [locale])
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, users, conversations, messages, mutate, markConversationRead } = useApp()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)
  const visibleConversations = useMemo(() => conversations
    .filter((conversation) => conversation.participantIds?.includes(user.id))
    .sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)), [conversations, user.id])
  const activeId = conversationId
  const activeConversation = visibleConversations.find((conversation) => conversation.id === activeId)
  const activeMessages = messagesForConversation(messages, activeId)
  const partner = activeConversation && conversationPartner(activeConversation, user.id, users)
  const unreadTotal = unreadCount(messages, conversations, user.id)

  useEffect(() => {
    if (activeConversation) markConversationRead(activeConversation.id)
  }, [activeConversation?.id, messages, markConversationRead])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [activeId, messages.length])

  const send = async (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !activeConversation || sending) return
    setSending(true)
    const createdAt = new Date().toISOString()
    try {
      await mutate(async () => {
        await api.create('messages', { id: `message-${crypto.randomUUID()}`, conversationId: activeConversation.id, senderId: user.id, body, createdAt, readBy: [user.id] })
        return api.update('conversations', activeConversation.id, { ...activeConversation, lastMessageAt: createdAt })
      }, 'Message envoyé.')
      setDraft('')
    } finally { setSending(false) }
  }

  return <div className={`messages-layout ${conversationId ? 'has-active' : ''}`}>
    <aside className="conversation-list" aria-label="Conversations">
      <div className="conversation-list-header"><div><span className="eyebrow">Échanges privés</span><h2>Messages</h2></div>{unreadTotal > 0 && <span className="conversation-total" aria-label={`${unreadTotal} messages non lus`}>{unreadTotal}</span>}</div>
      {visibleConversations.length ? <div className="conversation-list-scroll">{visibleConversations.map((conversation) => {
        const correspondent = conversationPartner(conversation, user.id, users)
        const thread = messagesForConversation(messages, conversation.id)
        const last = thread.at(-1)
        const unread = unreadCount(messages, conversations, user.id, conversation.id)
        return <Link key={conversation.id} to={`/messages/${conversation.id}`} className={`conversation-row ${conversation.id === activeId ? 'active' : ''}`}>
          <span className={`avatar avatar-${correspondent?.accent}`}>{correspondent?.avatar}</span><span className="conversation-row-main"><strong>{correspondent?.name}</strong><small>{last?.body || 'Nouvelle conversation'}</small></span><span className="conversation-row-meta"><time>{conversationDate(last?.createdAt || conversation.lastMessageAt, locale)}</time>{unread > 0 && <b aria-label={`${unread} messages non lus`}>{unread}</b>}</span>
        </Link>
      })}</div> : <div className="message-empty small"><MessageCircle size={23} /><p>Vos prochaines conversations apparaîtront ici.</p></div>}
    </aside>
    <section className="conversation-thread" aria-label="Conversation active">
      {activeConversation && partner ? <><header className="thread-header"><button className="thread-back" onClick={() => navigate('/messages')} aria-label="Retour aux conversations"><ArrowLeft size={19} /></button><span className={`avatar avatar-${partner.accent}`}>{partner.avatar}</span><div><strong>{partner.name}</strong><small>{partner.role === 'recruiter' ? (partner.company || partner.title) : partner.title}</small></div>{partner.role === 'recruiter' && partner.company && <span className="company-badge"><Building2 size={13} />{partner.company}</span>}<button className="icon-button thread-close" onClick={() => navigate('/messages')} aria-label="Fermer la conversation"><X size={17} /></button></header><div className="thread-scroll">{activeMessages.map((message, index) => { const sent = message.senderId === user.id; const previous = activeMessages[index - 1]; const newDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString(); return <div key={message.id}>{newDay && <div className="message-day"><span>{dayFormat.format(new Date(message.createdAt))}</span></div>}<article className={`message-bubble ${sent ? 'sent' : 'received'}`}><p>{message.body}</p><time>{timeFormat.format(new Date(message.createdAt))}{sent && <span aria-label="lu"> · {message.readBy?.includes(partner.id) ? 'Lu' : 'Envoyé'}</span>}</time></article></div> })}<div ref={endRef} /></div><form className="message-composer" onSubmit={send}><label className="sr-only" htmlFor="message-draft">Votre message</label><textarea id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength="2000" rows="1" placeholder={`Écrire à ${partner.name.split(' ')[0]}…`} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><button className="icon-button send-button" type="submit" disabled={!draft.trim() || sending} aria-label="Envoyer le message"><Send size={18} /></button></form></> : <div className="message-empty"><span className="empty-icon"><MessageCircle size={28} /></span><h2>Choisissez une conversation.</h2><p>Ouvrez un échange existant ou contactez un talent depuis son portfolio.</p></div>}
    </section>
  </div>
}
