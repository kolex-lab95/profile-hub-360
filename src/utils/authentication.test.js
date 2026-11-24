import { describe, expect, it } from 'vitest'
import { accountFromSignup, dashboardPathForRole, emailIsAvailable, matchingAccount, signupValidationError } from './authentication'

describe('authentication helpers', () => {
  const users = [{ id: 'candidate', email: 'amel@portfolio.test', password: 'secret1', role: 'student' }]

  it('matches an existing account without exposing prefilled credentials', () => {
    expect(matchingAccount(users, ' AMEL@PORTFOLIO.TEST ', 'secret1')?.id).toBe('candidate')
    expect(matchingAccount(users, 'amel@portfolio.test', 'wrong')).toBeNull()
  })

  it('prevents duplicate emails independently from their casing', () => {
    expect(emailIsAvailable(users, 'amel@portfolio.test')).toBe(false)
    expect(emailIsAvailable(users, ' new@portfolio.test ')).toBe(true)
  })

  it('creates compatible candidate and recruiter payloads without leaking a company to a candidate', () => {
    const candidate = accountFromSignup({ name: 'Lina Bâ', email: ' LINA@EXAMPLE.COM ', password: 'secret1', role: 'student', company: 'Saisie conservée' }, 'student-1')
    const recruiter = accountFromSignup({ name: 'Nora Blanc', email: 'nora@example.com', password: 'secret1', role: 'recruiter', company: ' NovaLabs ' }, 'recruiter-1')
    expect(candidate).toMatchObject({ id: 'student-1', name: 'Lina Bâ', email: 'lina@example.com', role: 'student', avatar: 'LB', accent: 'coral', availability: 'Disponible' })
    expect(candidate).not.toHaveProperty('company')
    expect(recruiter).toMatchObject({ role: 'recruiter', title: 'Recruteur·se', accent: 'blue', availability: '', company: 'NovaLabs' })
  })

  it('validates the company only for a recruiter and redirects from the persisted account role', () => {
    const candidate = { name: 'Lina Bâ', email: 'lina@example.com', password: 'secret1', role: 'student', company: '' }
    const recruiter = { ...candidate, role: 'recruiter' }
    expect(signupValidationError(users, candidate)).toBe('')
    expect(signupValidationError(users, recruiter)).toBe('Indiquez le nom de votre entreprise.')
    expect(signupValidationError(users, { ...recruiter, company: 'NovaLabs' })).toBe('')
    expect(dashboardPathForRole('student')).toBe('/etudiant')
    expect(dashboardPathForRole('recruiter')).toBe('/recruteur')
    expect(dashboardPathForRole('unknown')).toBe('/')
  })
})
