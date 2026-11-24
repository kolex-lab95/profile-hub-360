import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { interfaceTranslations } from './interfaceTranslations'

const LANGUAGE_KEY = 'portfolio-hub-language'

export const messages = {
  fr: { language: { label: 'Langue', menu: 'Choisir la langue', french: 'Français', english: 'English' }, public: { signIn: 'Connexion' }, common: { save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer', settings: 'Paramètres', messages: 'Messages', logout: 'Se déconnecter' }, roles: { student: 'Étudiant', recruiter: 'Recruteur' }, auth: { invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.' }, nav: { overview: 'Vue d’ensemble', projects: 'Mes projets', statistics: 'Statistiques', portfolio: 'Mon portfolio', talents: 'Trouver des talents', favorites: 'Mes favoris' } },
  en: { language: { label: 'Language', menu: 'Choose language', french: 'French', english: 'English' }, public: { signIn: 'Sign in' }, common: { save: 'Save', cancel: 'Cancel', close: 'Close', settings: 'Settings', messages: 'Messages', logout: 'Sign out' }, roles: { student: 'Student', recruiter: 'Recruiter' }, auth: { invalidCredentials: 'Incorrect email address or password.' }, nav: { overview: 'Overview', projects: 'My projects', statistics: 'Statistics', portfolio: 'My portfolio', talents: 'Find talent', favorites: 'My favorites' } },
}

const I18nContext = createContext(null)
const atPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source)
export const interpolate = (message, values = {}) => String(message).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`)
export const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`

export function translateInterfaceText(value, language) {
  const text = String(value ?? '')
  if (language === 'fr') {
    const french = Object.entries(interfaceTranslations).find(([, english]) => english === text)?.[0]
    if (french) return french
    const deleted = text.match(/^“(.+)” and its information will no longer be visible\. This action cannot be undone\.$/)
    if (deleted) return `« ${deleted[1]} » et ses informations ne seront plus visibles. Cette action est irréversible.`
    const message = text.match(/^Write to (.+)…$/)
    if (message) return `Écrire à ${message[1]}…`
    const unread = text.match(/^(\d+) unread messages$/)
    if (unread) return `${unread[1]} messages non lus`
    return text
  }
  const english = interfaceTranslations[text]
  if (english) return english
  const deleted = text.match(/^« (.+) » et ses informations ne seront plus visibles\. Cette action est irréversible\.$/)
  if (deleted) return `“${deleted[1]}” and its information will no longer be visible. This action cannot be undone.`
  const message = text.match(/^Écrire à (.+)…$/)
  if (message) return `Write to ${message[1]}…`
  const unread = text.match(/^(\d+) messages non lus$/)
  if (unread) return `${unread[1]} unread messages`
  return text
}

function isUserContent(node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement
  return Boolean(element?.closest('.user-chip, .owner-line, .talent-heading, .project-card h3, .project-card p, .project-card .tech-list, .detail-copy h1, .detail-copy > p, .profile-info h1, .profile-info > p, .about-panel > p, .message-bubble, .conversation-row-main, .recent-list, .favorite-list article > div, .profile-preview h2, .profile-preview > p, .editable-skills, .location'))
}

function translateInterfaceNode(node, language) {
  if (isUserContent(node)) return
  if (node.nodeType === Node.TEXT_NODE) {
    const translated = translateInterfaceText(node.nodeValue, language)
    if (translated !== node.nodeValue) node.nodeValue = translated
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  ;['aria-label', 'placeholder', 'title'].forEach((attribute) => {
    if (!node.hasAttribute(attribute)) return
    const value = node.getAttribute(attribute)
    const translated = translateInterfaceText(value, language)
    if (translated !== value) node.setAttribute(attribute, translated)
  })
  node.childNodes.forEach((child) => translateInterfaceNode(child, language))
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'fr')
  useEffect(() => { localStorage.setItem(LANGUAGE_KEY, language); document.documentElement.lang = language }, [language])
  useLayoutEffect(() => {
    const root = document.body
    if (!root) return undefined
    const translate = () => translateInterfaceNode(root, language)
    translate()
    const observer = new MutationObserver(translate)
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title'] })
    return () => observer.disconnect()
  }, [language])
  const value = useMemo(() => ({ language, setLanguage, t: (key, values) => interpolate(atPath(messages[language], key) ?? atPath(messages.fr, key) ?? key, values), locale: language === 'en' ? 'en-US' : 'fr-FR' }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useTranslation must be used inside I18nProvider')
  return context
}
