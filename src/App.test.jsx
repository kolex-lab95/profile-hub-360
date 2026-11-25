import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const appState = vi.hoisted(() => ({ current: { users: [], status: 'ready', user: null, login: vi.fn(), logout: vi.fn(), mutate: vi.fn() } }))
const apiState = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('./context/AppContext', () => ({ useApp: () => appState.current }))
vi.mock('./services/api', () => ({ api: { create: apiState.create } }))

import { LandingPage, LoginPage, SignupPage } from './App'
import { I18nProvider } from './i18n/I18n'

afterEach(() => {
  cleanup()
  localStorage.clear()
  appState.current.login.mockReset()
  appState.current.logout.mockReset()
  appState.current.mutate.mockReset()
  apiState.create.mockReset()
  appState.current = { users: [], status: 'ready', user: null, login: appState.current.login, logout: appState.current.logout, mutate: appState.current.mutate }
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

  it.each([
    ['student', '/etudiant', 'Student dashboard'],
    ['recruiter', '/recruteur', 'Recruiter dashboard'],
  ])('keeps an active session on the login page and routes a %s after authentication', (role, destination, dashboardLabel) => {
    const account = { id: `${role}-1`, email: `${role}@portfolio.test`, password: 'secret1', role }
    appState.current = { ...appState.current, users: [account], user: account }
    render(<MemoryRouter initialEntries={['/connexion']}><I18nProvider><Routes><Route path="/connexion" element={<LoginPage />} /><Route path={destination} element={<p>{dashboardLabel}</p>} /></Routes></I18nProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeTruthy()
    expect(appState.current.logout).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: account.email } })
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: account.password } })
    fireEvent.click(screen.getByRole('button', { name: 'Accéder à mon espace' }))
    expect(appState.current.login).toHaveBeenCalledWith(account)
    expect(screen.getByText(dashboardLabel)).toBeTruthy()
  })
})

describe('sign-up flow', () => {
  const existingSession = { id: 'existing-user', role: 'student' }

  const renderSignup = () => render(<MemoryRouter initialEntries={['/inscription']}><I18nProvider><Routes><Route path="/inscription" element={<SignupPage />} /><Route path="/connexion" element={<p data-testid="login-page">Login page</p>} /></Routes></I18nProvider></MemoryRouter>)
  const fillSignup = ({ role, email }) => {
    if (role === 'recruiter') fireEvent.click(screen.getByRole('radio', { name: 'Recruteur·se' }))
    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Nora Blanc' } })
    if (role === 'recruiter') fireEvent.change(screen.getByLabelText('Entreprise'), { target: { value: 'NovaLabs' } })
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: email } })
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret1' } })
  }

  it.each([
    ['student', 'student-new@portfolio.test'],
    ['recruiter', 'recruiter-new@portfolio.test'],
  ])('creates a %s account then returns to login without opening a session', async (role, email) => {
    localStorage.setItem('portfolio-hub-session', JSON.stringify(existingSession))
    appState.current = { ...appState.current, user: existingSession }
    apiState.create.mockImplementation(async (_, account) => account)
    appState.current.mutate.mockImplementation(async (operation) => operation())
    renderSignup()
    fillSignup({ role, email })
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }))
    expect(await screen.findByTestId('login-page')).toBeTruthy()
    expect(apiState.create).toHaveBeenCalledWith('users', expect.objectContaining({ email, role }))
    expect(appState.current.mutate).toHaveBeenCalledWith(expect.any(Function), 'Compte créé avec succès. Connectez-vous pour accéder à votre espace.')
    expect(appState.current.login).not.toHaveBeenCalled()
    expect(localStorage.getItem('portfolio-hub-session')).toBe(JSON.stringify(existingSession))
  })

  it('preserves the form and avoids redirection when account creation fails', async () => {
    localStorage.setItem('portfolio-hub-session', JSON.stringify(existingSession))
    appState.current = { ...appState.current, user: existingSession }
    apiState.create.mockRejectedValue(new Error('request failed'))
    appState.current.mutate.mockImplementation(async (operation) => operation())
    renderSignup()
    fillSignup({ role: 'student', email: 'failure@portfolio.test' })
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }))
    await waitFor(() => expect(apiState.create).toHaveBeenCalled())
    expect(screen.queryByTestId('login-page')).toBeNull()
    expect(screen.getByLabelText('Nom complet').value).toBe('Nora Blanc')
    expect(screen.getByLabelText('Adresse e-mail').value).toBe('failure@portfolio.test')
    expect(appState.current.login).not.toHaveBeenCalled()
    expect(localStorage.getItem('portfolio-hub-session')).toBe(JSON.stringify(existingSession))
  })

  it('rejects an existing email before any account-creation request', () => {
    appState.current = { ...appState.current, users: [{ email: 'used@portfolio.test' }] }
    renderSignup()
    fillSignup({ role: 'student', email: 'used@portfolio.test' })
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }))
    expect(screen.getByText('Cette adresse e-mail est déjà utilisée.')).toBeTruthy()
    expect(appState.current.mutate).not.toHaveBeenCalled()
    expect(apiState.create).not.toHaveBeenCalled()
  })
})
