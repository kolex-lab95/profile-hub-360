const DAY_MS = 24 * 60 * 60 * 1000

function validDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfUtcWeek(value) {
  const date = new Date(value)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date
}

function percentageChange(current, previous) {
  if (!previous) return current ? 'Nouveau' : '—'
  const percent = Math.round(((current - previous) / previous) * 100)
  return `${percent > 0 ? '+' : ''}${percent} %`
}

function isExternalView(view, studentId, users) {
  if (!view.viewerId || view.viewerId === studentId) return false
  const viewer = users.find((user) => user.id === view.viewerId)
  return !viewer || viewer.role === 'recruiter'
}

export function studentMetrics(views, projects, studentId, { now = new Date(), users = [] } = {}) {
  const referenceDate = validDate(now) || new Date()
  const ownProjects = projects.filter((project) => project.ownerId === studentId)
  const visibleProjectIds = new Set(ownProjects.filter((project) => project.published).map((project) => project.id))
  const validViews = views.filter((view) => {
    const viewedAt = validDate(view.viewedAt)
    const isKnownProject = view.projectId ? visibleProjectIds.has(view.projectId) : true
    return view.studentId === studentId && isKnownProject && viewedAt && viewedAt <= referenceDate && isExternalView(view, studentId, users)
  })
  const profileViews = validViews.filter((view) => !view.projectId)
  const projectViews = validViews.filter((view) => view.projectId)
  const byProject = ownProjects
    .map((project) => ({ ...project, views: projectViews.filter((view) => view.projectId === project.id).length }))
    .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title, 'fr'))

  const currentWeekStart = startOfUtcWeek(referenceDate)
  const bucketFor = (events, start) => events.filter((view) => {
    const viewedAt = validDate(view.viewedAt)
    return viewedAt >= start && viewedAt < new Date(start.getTime() + (7 * DAY_MS))
  }).length
  const weekly = Array.from({ length: 4 }, (_, index) => {
    const start = new Date(currentWeekStart.getTime() - ((3 - index) * 7 * DAY_MS))
    return { label: `S${index + 1}`, total: bucketFor(validViews, start), start }
  })
  const currentPeriodStart = weekly[0].start
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - (4 * 7 * DAY_MS))
  const inRange = (view, start, end) => {
    const viewedAt = validDate(view.viewedAt)
    return viewedAt >= start && viewedAt < end
  }
  const currentProfileViews = profileViews.filter((view) => inRange(view, currentPeriodStart, new Date(currentWeekStart.getTime() + (7 * DAY_MS)))).length
  const currentProjectViews = projectViews.filter((view) => inRange(view, currentPeriodStart, new Date(currentWeekStart.getTime() + (7 * DAY_MS)))).length
  const previousProfileViews = profileViews.filter((view) => inRange(view, previousPeriodStart, currentPeriodStart)).length
  const previousProjectViews = projectViews.filter((view) => inRange(view, previousPeriodStart, currentPeriodStart)).length

  return {
    published: ownProjects.filter((project) => project.published).length,
    profileViews: profileViews.length,
    projectViews: projectViews.length,
    uniqueRecruiters: new Set(validViews.map((view) => view.viewerId)).size,
    byProject,
    topProject: byProject.find((project) => project.views > 0) || null,
    weekly,
    weeklyTotal: weekly.reduce((total, week) => total + week.total, 0),
    profileTrend: percentageChange(currentProfileViews, previousProfileViews),
    projectTrend: percentageChange(currentProjectViews, previousProjectViews),
  }
}

export function matchScore(student, query, skill) {
  const haystack = `${student.name} ${student.title} ${student.bio} ${student.skills.join(' ')}`.toLowerCase()
  const queryMatch = !query || haystack.includes(query.toLowerCase())
  const skillMatch = !skill || student.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
  return queryMatch && skillMatch
}
