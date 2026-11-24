import { describe, expect, it } from 'vitest'
import { accountFromSignup, emailIsAvailable, matchingAccount } from './authentication'

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

  it('creates the same compatible candidate and recruiter payloads from the public form', () => {
    expect(accountFromSignup({ name: 'Lina Bâ', email: ' LINA@EXAMPLE.COM ', password: 'secret1', role: 'student' }, 'student-1')).toMatchObject({ id: 'student-1', name: 'Lina Bâ', email: 'lina@example.com', role: 'student', avatar: 'LB', accent: 'coral', availability: 'Disponible' })
    expect(accountFromSignup({ name: 'Nora Blanc', email: 'nora@example.com', password: 'secret1', role: 'recruiter' }, 'recruiter-1')).toMatchObject({ role: 'recruiter', title: 'Recruteur·se', accent: 'blue', availability: '' })
  })
})
