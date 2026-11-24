import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const appState = vi.hoisted(() => ({ current: { users: [], status: 'ready', user: null, login: vi.fn(), logout: vi.fn() } }))

vi.mock('./context/AppContext', () => ({ useApp: () => appState.current }))

import { LandingPage, LoginPage } from './App'
import { I18nProvider } from './i18n/I18n'

afterEach(() => {
  cleanup()
  localStorage.clear()
  appState.current.login.mockReset()
  appState.current.logout.mockReset()
  appState.current = { users: [], status: 'ready', user: null, login: appState.current.login, logout: appState.current.logout }
})

describe('public sign-in action', () => {
  it.each([
    ['FR déconnecté', 'fr', null, 'Connexion'],
    ['EN déconnecté', 'en', null, 'Sign in'],
    ['FR connecté', 'fr', { id: 'student-1', role: 'student' }, 'Connexion'],
    ['EN connecté', 'en', { id: 'recruiter-1', role: 'recruiter' }, 'Sign in'],
  ])('%s always opens the login route', (_, language, user, label) => {
    localStorage.setItem('portfolio-hub-language', language)
    appState.current.user = user
    render(<MemoryRouter><I18nProvider><LandingPage /></I18nProvider></MemoryRouter>)
    expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe('/connexion')
  })

  it('keeps an active session on the login page and preserves normal post-login routing', () => {
    const account = { id: 'student-1', email: 'amel@portfolio.test', password: 'secret1', role: 'student' }
    appState.current = { ...appState.current, users: [account], user: account }
    render(<MemoryRouter initialEntries={['/connexion']}><I18nProvider><Routes><Route path="/connexion" element={<LoginPage />} /><Route path="/etudiant" element={<p>Student dashboard</p>} /></Routes></I18nProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeTruthy()
    expect(appState.current.logout).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: account.email } })
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: account.password } })
    fireEvent.click(screen.getByRole('button', { name: 'Accéder à mon espace' }))
    expect(appState.current.login).toHaveBeenCalledWith(account)
    expect(screen.getByText('Student dashboard')).toBeTruthy()
  })
})
