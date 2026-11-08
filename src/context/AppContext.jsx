import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const AppContext = createContext(null)
const SESSION_KEY = 'portfolio-hub-session'
const THEME_KEY = 'portfolio-hub-theme'

export function AppProvider({ children }) {
  const [data, setData] = useState({ users: [], projects: [], views: [], favorites: [], recentProfiles: [] })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'))
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'cobalt')
  const [notice, setNotice] = useState(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    try {
      const [users, projects, views, favorites, recentProfiles] = await Promise.all([
        api.getAll('users'), api.getAll('projects'), api.getAll('views'), api.getAll('favorites'), api.getAll('recentProfiles'),
      ])
      setData({ users, projects, views, favorites, recentProfiles })
      setStatus('ready')
    } catch (err) {
      setError('Impossible de joindre l’API de démonstration. Lancez « npm run dev » afin de démarrer Vite et json-server.')
      setStatus('error')
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
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
    try { const result = await operation(); await refresh(); if (successMessage) flash(successMessage); return result }
    catch (err) { flash('Cette opération n’a pas abouti. Réessayez dans quelques instants.', 'error'); throw err }
  }

  const value = useMemo(() => ({ ...data, status, error, user, theme, notice, login, logout, setTheme, refresh, flash, mutate }), [data, status, error, user, theme, notice, refresh])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
