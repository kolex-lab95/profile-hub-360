import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider, useTranslation } from './I18n'

function PreferenceFixture() {
  const { language, setLanguage, t } = useTranslation()
  const [draft, setDraft] = useState('Portfolio en cours')
  return <><p data-testid="language">{language}</p><p>{t('nav.projects')}</p><div className="project-card"><p data-testid="user-content">Disponible</p></div><input aria-label="draft" value={draft} onChange={(event) => setDraft(event.target.value)} /><button onClick={() => setLanguage('en')}>English</button></>
}

describe('I18nProvider', () => {
  it('switches immediately, persists the choice and keeps form state', () => {
    localStorage.clear()
    localStorage.setItem('portfolio-hub-session', JSON.stringify({ id: 'student-1' }))
    localStorage.setItem('portfolio-hub-theme', 'jade')
    document.documentElement.dataset.theme = 'jade'
    render(<I18nProvider><PreferenceFixture /></I18nProvider>)
    fireEvent.change(screen.getByLabelText('draft'), { target: { value: 'Draft to preserve' } })
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByTestId('language').textContent).toBe('en')
    expect(screen.getByText('My projects')).toBeTruthy()
    expect(screen.getByLabelText('draft').value).toBe('Draft to preserve')
    expect(screen.getByTestId('user-content').textContent).toBe('Disponible')
    expect(localStorage.getItem('portfolio-hub-language')).toBe('en')
    expect(localStorage.getItem('portfolio-hub-session')).toBe(JSON.stringify({ id: 'student-1' }))
    expect(localStorage.getItem('portfolio-hub-theme')).toBe('jade')
    expect(document.documentElement.dataset.theme).toBe('jade')
  })
})
