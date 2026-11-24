export function projectSummary(projects, ownerId) {
  const ownProjects = projects.filter((project) => project.ownerId === ownerId)
  const published = ownProjects.filter((project) => project.published).length
  return { total: ownProjects.length, published, drafts: ownProjects.length - published }
}

export function projectSummaryLabel({ total, published, drafts }, locale = 'fr-FR') {
  if (locale.startsWith('en')) {
    const word = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`
    return `${word(total, 'project', 'projects')} · ${word(published, 'published project', 'published projects')} · ${word(drafts, 'draft', 'drafts')}`
  }
  const word = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`
  return `${word(total, 'projet', 'projets')} · ${word(published, 'publié', 'publiés')} · ${word(drafts, 'brouillon', 'brouillons')}`
}

export function publicationFields(existingProject, published, timestamp) {
  if (!published) return {}
  if (!existingProject || (!existingProject.published && !existingProject.publishedAt)) return { publishedAt: timestamp }
  return {}
}
