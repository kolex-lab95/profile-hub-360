import { describe, expect, it } from 'vitest'
import { portfolioPdfLabels } from './exportPortfolio'

describe('portfolioPdfLabels', () => {
  it('uses the active locale for PDF headings', () => {
    expect(portfolioPdfLabels('fr-FR')).toMatchObject({ profile: 'Profil', skills: 'Compétences', projects: 'Projets sélectionnés' })
    expect(portfolioPdfLabels('en-US')).toMatchObject({ profile: 'Profile', skills: 'Skills', projects: 'Selected projects' })
  })
})
