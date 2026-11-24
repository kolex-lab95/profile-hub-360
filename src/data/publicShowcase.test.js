import { describe, expect, it } from 'vitest'
import { publicShowcaseProjects } from './publicShowcase'

describe('public showcase projects', () => {
  it('provides a stable, generic three-project showcase without platform owner identifiers', () => {
    expect(publicShowcaseProjects).toHaveLength(3)
    expect(publicShowcaseProjects.map((project) => project.id)).toEqual(['showcase-atelier', 'showcase-flux', 'showcase-signal'])
    expect(publicShowcaseProjects.every((project) => !('ownerId' in project) && project.technologies.length > 0)).toBe(true)
  })
})
