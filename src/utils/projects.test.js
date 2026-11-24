import { describe, expect, it } from 'vitest'
import { projectSummary, projectSummaryLabel, publicationFields } from './projects'

describe('project summary', () => {
  it('counts only the current student projects and uses French singular/plural labels', () => {
    const projects = [
      { id: 'a', ownerId: 'student', published: true },
      { id: 'b', ownerId: 'student', published: true },
      { id: 'c', ownerId: 'student', published: false },
      { id: 'd', ownerId: 'other', published: false },
    ]
    expect(projectSummary(projects, 'student')).toEqual({ total: 3, published: 2, drafts: 1 })
    expect(projectSummaryLabel(projectSummary(projects, 'student'))).toBe('3 projets · 2 publiés · 1 brouillon')
    expect(projectSummaryLabel({ total: 1, published: 1, drafts: 0 })).toBe('1 projet · 1 publié · 0 brouillons')
    expect(projectSummaryLabel({ total: 1, published: 1, drafts: 0 }, 'en-US')).toBe('1 project · 1 published project · 0 drafts')
    expect(projectSummaryLabel({ total: 2, published: 1, drafts: 1 }, 'en-US')).toBe('2 projects · 1 published project · 1 draft')
  })
})

describe('publicationFields', () => {
  const firstPublication = '2026-11-23T09:00:00.000Z'

  it('sets publishedAt only for a first effective publication', () => {
    expect(publicationFields(null, true, firstPublication)).toEqual({ publishedAt: firstPublication })
    expect(publicationFields(null, false, firstPublication)).toEqual({})
    expect(publicationFields({ id: 'draft', published: false }, true, firstPublication)).toEqual({ publishedAt: firstPublication })
  })

  it('never rewrites a known publication date after edits, unpublishing or republishing', () => {
    const published = { id: 'published', published: true, publishedAt: firstPublication }
    const unpublished = { id: 'unpublished', published: false, publishedAt: firstPublication }
    expect(publicationFields(published, true, '2026-11-24T09:00:00.000Z')).toEqual({})
    expect(publicationFields(unpublished, true, '2026-11-24T09:00:00.000Z')).toEqual({})
    expect(publicationFields(published, false, '2026-11-24T09:00:00.000Z')).toEqual({})
  })

  it('does not invent a date for historical published projects with no known publication timestamp', () => {
    expect(publicationFields({ id: 'legacy', published: true }, true, firstPublication)).toEqual({})
  })
})
