import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LANGUAGE_KEY = 'portfolio-hub-language'

export const messages = {
  fr: { language: { label: 'Langue' }, common: { save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer', settings: 'Paramètres', messages: 'Messages', logout: 'Se déconnecter' }, nav: { overview: 'Vue d’ensemble', projects: 'Mes projets', statistics: 'Statistiques', portfolio: 'Mon portfolio', talents: 'Trouver des talents', favorites: 'Mes favoris' } },
  en: { language: { label: 'Language' }, common: { save: 'Save', cancel: 'Cancel', close: 'Close', settings: 'Settings', messages: 'Messages', logout: 'Sign out' }, nav: { overview: 'Overview', projects: 'My projects', statistics: 'Statistics', portfolio: 'My portfolio', talents: 'Find talent', favorites: 'My favorites' } },
}

const I18nContext = createContext(null)
const atPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source)
export const interpolate = (message, values = {}) => String(message).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`)

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'fr')
  useEffect(() => { localStorage.setItem(LANGUAGE_KEY, language); document.documentElement.lang = language }, [language])
  const value = useMemo(() => ({ language, setLanguage, t: (key, values) => interpolate(atPath(messages[language], key) ?? atPath(messages.fr, key) ?? key, values), locale: language === 'en' ? 'en-US' : 'fr-FR' }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useTranslation must be used inside I18nProvider')
  return context
}
