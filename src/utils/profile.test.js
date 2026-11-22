import { describe, expect, it } from 'vitest'
import { availabilityLabel, isAvailable } from './profile'

describe('availability helpers', () => {
  it('keeps legacy availability copy for an available profile', () => {
    const profile = { availability: 'Disponible dès juillet' }
    expect(isAvailable(profile)).toBe(true)
    expect(availabilityLabel(profile)).toBe('Disponible dès juillet')
  })

  it('makes an explicitly unavailable profile filterable and legible', () => {
    const profile = { availability: 'Disponible', availabilityStatus: 'unavailable' }
    expect(isAvailable(profile)).toBe(false)
    expect(availabilityLabel(profile)).toBe('Indisponible')
  })
})
