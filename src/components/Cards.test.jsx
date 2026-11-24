import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProjectCard, TalentCard } from './Cards'

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

describe('ProjectCard illustrative mode', () => {
  it('keeps an example card independent from profile and project routes', () => {
    render(<MemoryRouter><ProjectCard project={{ id: 'showcase', title: 'Atelier nomade', category: 'Application web', description: 'Une présentation illustrative de projet.', technologies: ['React'], visual: 'orange' }} owner={{ name: 'Portfolio Hub', avatar: 'PH', accent: 'gold' }} ownerLink={false} projectLink={false} illustrative /></MemoryRouter>)
    expect(screen.getByText('Atelier nomade')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Atelier nomade' })).toBeNull()
    expect(screen.queryByRole('link', { name: /Portfolio Hub/ })).toBeNull()
    expect(screen.getByText('Exemple')).toBeTruthy()
  })
})
