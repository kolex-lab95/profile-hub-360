import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TalentCard } from './Cards'

describe('TalentCard favorite heart', () => {
  it('keeps the favorite interaction while using a padded, unclipped SVG viewport', () => {
    const onFavorite = vi.fn()
    render(<MemoryRouter><TalentCard student={{ id: 'student', name: 'Élise Martin', title: 'Développeuse', location: 'Paris', skills: ['React'], accent: 'coral', avatar: 'ÉM', availability: 'Disponible' }} projectsCount={2} favorite={false} onFavorite={onFavorite} /></MemoryRouter>)
    const button = screen.getByRole('button', { name: 'Ajouter le profil aux favoris' })
    const heart = button.querySelector('svg')
    expect(heart?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(heart?.getAttribute('overflow')).toBe('visible')
    expect(heart?.querySelector('path')?.getAttribute('d')).toContain('20.84')
    fireEvent.click(button)
    expect(onFavorite).toHaveBeenCalledTimes(1)
  })
})
