function publicationMoment(project) {
  const value = project.publishedAt || project.createdAt || project.updatedAt
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function selectPublicProjects(projects, users, limit = 3) {
  const publicOwners = new Set(users.filter((user) => user.role === 'student').map((user) => user.id))
  return projects
    .filter((project) => project.published && publicOwners.has(project.ownerId))
    .slice()
    .sort((first, second) => publicationMoment(second) - publicationMoment(first) || first.title.localeCompare(second.title, 'fr') || first.id.localeCompare(second.id))
    .slice(0, limit)
}
