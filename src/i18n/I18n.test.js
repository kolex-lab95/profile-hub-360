import { describe, expect, it } from 'vitest'
import { interpolate, messages, plural, translateInterfaceText } from './I18n'

describe('i18n resources', () => {
  it('keeps matching public labels in French and English', () => {
    expect(messages.fr.nav.projects).toBe('Mes projets')
    expect(messages.en.nav.projects).toBe('My projects')
  })
  it('interpolates dynamic values without exposing translation keys', () => {
    expect(interpolate('Hello, {name}.', { name: 'Nadia' })).toBe('Hello, Nadia.')
  })
  it('contains translated role and authentication-error resources', () => {
    expect(messages.fr.roles.student).toBe('Étudiant')
    expect(messages.en.roles.recruiter).toBe('Recruiter')
    expect(messages.en.auth.invalidCredentials).toBe('Incorrect email address or password.')
  })
  it('provides public-header labels in both languages', () => {
    expect(messages.fr.public).toEqual({ signIn: 'Connexion', dashboard: 'Tableau de bord' })
    expect(messages.en.public).toEqual({ signIn: 'Sign in', dashboard: 'Dashboard' })
  })
  it('handles singular and plural labels', () => {
    expect(plural(1, 'project', 'projects')).toBe('1 project')
    expect(plural(2, 'project', 'projects')).toBe('2 projects')
  })
  it('translates only known interface strings and leaves user content unchanged', () => {
    expect(translateInterfaceText('Mes projets', 'en')).toBe('My projects')
    expect(translateInterfaceText('My projects', 'fr')).toBe('Mes projets')
    expect(translateInterfaceText('Atelier nomade', 'en')).toBe('Atelier nomade')
    expect(translateInterfaceText('« Atelier nomade » et ses informations ne seront plus visibles. Cette action est irréversible.', 'en')).toBe('“Atelier nomade” and its information will no longer be visible. This action cannot be undone.')
    expect(translateInterfaceText('Write to Nadia…', 'fr')).toBe('Écrire à Nadia…')
  })
})
