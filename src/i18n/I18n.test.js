import { describe, expect, it } from 'vitest'
import { interpolate, messages } from './I18n'

describe('i18n resources', () => {
  it('keeps matching public labels in French and English', () => {
    expect(messages.fr.nav.projects).toBe('Mes projets')
    expect(messages.en.nav.projects).toBe('My projects')
  })
  it('interpolates dynamic values without exposing translation keys', () => {
    expect(interpolate('Hello, {name}.', { name: 'Nadia' })).toBe('Hello, Nadia.')
  })
})
