import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18n'
import { LanguageToggle } from './LanguageToggle'

describe('LanguageToggle', () => {
  it('opens the compact menu, updates the language and closes it', () => {
    localStorage.clear()
    render(<I18nProvider><LanguageToggle /></I18nProvider>)
    const trigger = screen.getByRole('button', { name: 'Choisir la langue' })
    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeTruthy()
    const english = screen.getByRole('menuitemradio', { name: 'English' })
    fireEvent.click(english)
    expect(localStorage.getItem('portfolio-hub-language')).toBe('en')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes the menu with Escape and restores focus to its trigger', () => {
    localStorage.clear()
    render(<I18nProvider><LanguageToggle /></I18nProvider>)
    const trigger = screen.getByRole('button', { name: 'Choisir la langue' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
