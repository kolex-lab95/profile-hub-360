import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { addFavoriteToList, removeFavoriteFromList } from '../utils/favorites'
import { directConversation, markConversationMessagesRead, unreadMessages } from '../utils/messaging'

const AppContext = createContext(null)
const SESSION_KEY = 'portfolio-hub-session'
const THEME_KEY = 'portfolio-hub-theme'

export function AppProvider({ children }) {
  const [data, setData] = useState({ users: [], projects: [], views: [], favorites: [], recentProfiles: [], conversations: [], messages: [] })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'))
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'cobalt')
  const [notice, setNotice] = useState(null)

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setStatus('loading')
    try {
      const [users, projects, views, favorites, recentProfiles, conversations, messages] = await Promise.all([
        api.getAll('users'), api.getAll('projects'), api.getAll('views'), api.getAll('favorites'), api.getAll('recentProfiles'), api.getAll('conversations'), api.getAll('messages'),
      ])
      setData({ users, projects, views, favorites, recentProfiles, conversations, messages })
      setError('')
      setStatus('ready')
    } catch (err) {
      if (!silent) {
        setError('Impossible de joindre l’API de démonstration. Lancez « npm run dev » afin de démarrer Vite et json-server.')
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const sync = () => { if (document.visibilityState === 'visible') refresh({ silent: true }) }
    const interval = window.setInterval(sync, 30000)
    document.addEventListener('visibilitychange', sync)
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', sync) }
  }, [refresh])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(THEME_KEY, theme) }, [theme])
  useEffect(() => {
    if (!notice) return undefined
    const id = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(id)
  }, [notice])

  const login = (nextUser) => { localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser)); setUser(nextUser) }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null); setNotice({ type: 'success', text: 'Vous êtes maintenant déconnecté·e.' }) }
  const setTheme = (nextTheme) => setThemeState(nextTheme)
  const flash = (text, type = 'success') => setNotice({ text, type })
  const mutate = async (operation, successMessage) => {
    try { const result = await operation(); await refresh({ silent: true }); if (successMessage) flash(successMessage); return result }
    catch (err) { flash('Cette opération n’a pas abouti. Réessayez dans quelques instants.', 'error'); throw err }
  }

  const createFavorite = async (favorite, successMessage = 'Favori ajouté à votre sélection.') => {
    setData((current) => ({ ...current, favorites: addFavoriteToList(current.favorites, favorite) }))
    try {
      const created = await api.create('favorites', favorite)
      setData((current) => ({ ...current, favorites: current.favorites.map((item) => item.id === favorite.id ? created : item) }))
      flash(successMessage)
      return created
    } catch (err) {
      setData((current) => ({ ...current, favorites: removeFavoriteFromList(current.favorites, favorite.id) }))
      flash('Cette opération n’a pas abouti. Réessayez dans quelques instants.', 'error')
      throw err
    }
  }

  const removeFavorite = async (favorite, successMessage = 'Favori retiré de votre sélection.') => {
    setData((current) => ({ ...current, favorites: removeFavoriteFromList(current.favorites, favorite.id) }))
    try {
      await api.remove('favorites', favorite.id)
      flash(successMessage)
    } catch (err) {
      setData((current) => ({ ...current, favorites: addFavoriteToList(current.favorites, favorite) }))
      flash('Cette opération n’a pas abouti. Réessayez dans quelques instants.', 'error')
      throw err
    }
  }

  const updateCurrentUser = async (updates, successMessage = 'Profil mis à jour.') => {
    const updated = await mutate(() => api.update('users', user.id, { ...user, ...updates }), successMessage)
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    setUser(updated)
    return updated
  }

  const getOrCreateConversation = async (peerId) => {
    const existing = directConversation(data.conversations, user.id, peerId)
    if (existing) return existing
    return mutate(() => api.create('conversations', {
      id: `conversation-${crypto.randomUUID()}`,
      participantIds: [user.id, peerId],
      createdAt: new Date().toISOString(),
      lastMessageAt: null,
    }))
  }

  const markConversationRead = async (conversationId) => {
    const conversation = data.conversations.find((item) => item.id === conversationId && item.participantIds?.includes(user?.id))
    if (!conversation) return
    const unread = unreadMessages(data.messages, data.conversations, user.id, conversationId)
    if (!unread.length) return
    try {
      const nextMessages = markConversationMessagesRead(data.messages, data.conversations, user.id, conversation.id)
      await Promise.all(unread.map((message) => api.update('messages', message.id, nextMessages.find((item) => item.id === message.id))))
      await refresh({ silent: true })
    } catch (err) { flash('Impossible de mettre à jour la lecture des messages.', 'error') }
  }

  const value = useMemo(() => ({ ...data, status, error, user, theme, notice, login, logout, setTheme, refresh, flash, mutate, createFavorite, removeFavorite, updateCurrentUser, getOrCreateConversation, markConversationRead }), [data, status, error, user, theme, notice, refresh])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
