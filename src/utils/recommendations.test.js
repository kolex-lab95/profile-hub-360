import { describe, expect, it } from 'vitest'
import { dashboardAdvice } from './recommendations'

function metrics(overrides = {}) {
  return {
    byProject: [],
    published: 0,
    profileViews: 0,
    projectViews: 0,
    visibilityComparison: { current: 0, previous: 0 },
    ...overrides,
  }
}

describe('dashboardAdvice', () => {
  it('encourages the student to create a first project when the portfolio is empty', () => {
    expect(dashboardAdvice(metrics()).title).toBe('Votre portfolio attend sa première réalisation.')
  })

  it('prioritizes publication when all existing projects are drafts', () => {
    const advice = dashboardAdvice(metrics({ byProject: [{ id: 'draft', title: 'Brouillon', views: 0 }] }))
    expect(advice.title).toBe('Préparez votre première publication.')
    expect(advice.description).toContain('brouillon')
  })

  it('suggests discoverability when published projects have no identified views', () => {
    const advice = dashboardAdvice(metrics({ published: 1, byProject: [{ id: 'published', title: 'Atlas', views: 0 }] }))
    expect(advice.title).toBe('Rendez votre portfolio plus facile à découvrir.')
  })

  it('identifies a real uniquely most-viewed project when no trend takes priority', () => {
    const advice = dashboardAdvice(metrics({
      published: 2,
      projectViews: 5,
      byProject: [{ id: 'atlas', title: 'Atlas', views: 4 }, { id: 'civic', title: 'Civic', views: 1 }],
    }))
    expect(advice.title).toBe('« Atlas » retient le plus l’attention.')
  })

  it('reports a comparable increase before project-level insight', () => {
    const advice = dashboardAdvice(metrics({
      published: 1,
      projectViews: 5,
      byProject: [{ id: 'atlas', title: 'Atlas', views: 5 }],
      visibilityComparison: { current: 5, previous: 2 },
    }))
    expect(advice.title).toBe('Votre visibilité progresse.')
  })

  it('reports a comparable decrease before project-level insight', () => {
    const advice = dashboardAdvice(metrics({
      published: 1,
      projectViews: 5,
      byProject: [{ id: 'atlas', title: 'Atlas', views: 5 }],
      visibilityComparison: { current: 2, previous: 5 },
    }))
    expect(advice.title).toBe('Relancez votre visibilité.')
  })

  it('stays neutral when there is no comparable period or unique project leader', () => {
    const advice = dashboardAdvice(metrics({
      published: 2,
      projectViews: 4,
      byProject: [{ id: 'atlas', title: 'Atlas', views: 2 }, { id: 'civic', title: 'Civic', views: 2 }],
    }))
    expect(advice.title).toBe('Observez les prochaines consultations.')
  })
})
