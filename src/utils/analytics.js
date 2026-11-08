export function studentMetrics(views, projects, studentId) {
  const ownViews = views.filter((view) => view.studentId === studentId)
  const profileViews = ownViews.filter((view) => !view.projectId)
  const projectViews = ownViews.filter((view) => view.projectId)
  const byProject = projects
    .filter((project) => project.ownerId === studentId)
    .map((project) => ({
      ...project,
      views: projectViews.filter((view) => view.projectId === project.id).length,
    }))
    .sort((a, b) => b.views - a.views)

  const weekly = Array.from({ length: 4 }, (_, index) => {
    const end = new Date('2026-11-02T23:59:59.999Z')
    end.setDate(end.getDate() - (3 - index) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    const total = ownViews.filter((view) => {
      const at = new Date(view.viewedAt)
      return at >= start && at <= end
    }).length
    return { label: `S${index + 1}`, total }
  })

  return {
    published: projects.filter((project) => project.ownerId === studentId && project.published).length,
    profileViews: profileViews.length,
    projectViews: projectViews.length,
    uniqueRecruiters: new Set(ownViews.map((view) => view.viewerId)).size,
    byProject,
    weekly,
  }
}

export function matchScore(student, query, skill) {
  const haystack = `${student.name} ${student.title} ${student.bio} ${student.skills.join(' ')}`.toLowerCase()
  const queryMatch = !query || haystack.includes(query.toLowerCase())
  const skillMatch = !skill || student.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
  return queryMatch && skillMatch
}
