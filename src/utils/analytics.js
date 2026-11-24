const DAY_MS = 24 * 60 * 60 * 1000

function validDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function timeZoneOrDefault(timeZone) {
  return timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function dateParts(value, timeZone) {
  const date = validDate(value)
  if (!date) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZoneOrDefault(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return { year: Number(byType.year), month: Number(byType.month), day: Number(byType.day) }
}

function dayKeyFromParts({ year, month, day }) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dayKey(value, timeZone) {
  const parts = dateParts(value, timeZone)
  return parts ? dayKeyFromParts(parts) : null
}

function shiftDay(parts, offset) {
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + offset, 12))
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() }
}

function dayIndex(key) {
  const [year, month, day] = key.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS)
}

function displayDayLabel(parts, timeZone) {
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: timeZoneOrDefault(timeZone) })
    .format(new Date(Date.UTC(parts.year, parts.month - 1, 15, 12)))
    .replace('.', '')
  return `${parts.day} ${month}`
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
  return viewer?.role === 'recruiter'
}

function uniqueViewKey(view) {
  return view.id || [view.studentId, view.projectId || 'profile', view.viewerId, view.viewedAt].join('|')
}

export function validStudentViews(views, projects, studentId, { now = new Date(), users = [] } = {}) {
  const referenceDate = validDate(now) || new Date()
  const ownProjects = projects.filter((project) => project.ownerId === studentId)
  const visibleProjectIds = new Set(ownProjects.filter((project) => project.published).map((project) => project.id))
  const seen = new Set()
  return views.filter((view) => {
    const viewedAt = validDate(view.viewedAt)
    const isKnownProject = view.projectId ? visibleProjectIds.has(view.projectId) : true
    const isValid = view.studentId === studentId && isKnownProject && viewedAt && viewedAt <= referenceDate && isExternalView(view, studentId, users)
    if (!isValid) return false
    const uniqueKey = uniqueViewKey(view)
    if (seen.has(uniqueKey)) return false
    seen.add(uniqueKey)
    return true
  })
}

export function dailyVisibility(views, projects, studentId, { now = new Date(), users = [], timeZone } = {}) {
  const referenceDate = validDate(now) || new Date()
  const activeTimeZone = timeZoneOrDefault(timeZone)
  const today = dateParts(referenceDate, activeTimeZone)
  const slots = Array.from({ length: 14 }, (_, index) => {
    const parts = shiftDay(today, index - 13)
    return { key: dayKeyFromParts(parts), parts, total: 0 }
  })
  const slotByKey = new Map(slots.map((slot) => [slot.key, slot]))
  validStudentViews(views, projects, studentId, { now: referenceDate, users }).forEach((view) => {
    const slot = slotByKey.get(dayKey(view.viewedAt, activeTimeZone))
    if (slot) slot.total += 1
  })
  return slots.map((slot, index) => ({
    key: slot.key,
    total: slot.total,
    label: index % 2 === 0 || index === 13 ? displayDayLabel(slot.parts, activeTimeZone) : '',
  }))
}

export function relativeDateFr(value, now = new Date(), { timeZone } = {}) {
  const date = validDate(value)
  const referenceDate = validDate(now)
  if (!date || !referenceDate) return ''
  const diff = Math.max(0, referenceDate.getTime() - date.getTime())
  const eventDay = dayKey(date, timeZone)
  const today = dayKey(referenceDate, timeZone)
  const calendarDifference = dayIndex(today) - dayIndex(eventDay)
  if (calendarDifference === 1) return 'Hier'
  if (calendarDifference === 0 && diff < 2 * 60 * 1000) return 'À l’instant'
  if (calendarDifference === 0 && diff < 60 * 60 * 1000) {
    const minutes = Math.max(2, Math.floor(diff / (60 * 1000)))
    return `Il y a ${minutes} minutes`
  }
  if (calendarDifference === 0 && diff < DAY_MS) {
    const hours = Math.max(1, Math.floor(diff / (60 * 60 * 1000)))
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  }
  if (calendarDifference > 1 && calendarDifference <= 6) return `Il y a ${calendarDifference} jours`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: timeZoneOrDefault(timeZone) }).format(date)
}

export function recentStudentActivity(views, projects, studentId, { now = new Date(), users = [], timeZone } = {}) {
  return validStudentViews(views, projects, studentId, { now, users })
    .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt) || String(a.id || '').localeCompare(String(b.id || '')))
    .slice(0, 5)
    .map((view) => {
      const visitor = users.find((user) => user.id === view.viewerId)
      const project = view.projectId ? projects.find((item) => item.id === view.projectId) : null
      return {
        id: view.id || `${view.viewerId}-${view.viewedAt}-${view.projectId || 'profile'}`,
        visitor,
        visitorName: visitor.name,
        type: project ? 'project' : 'profile',
        projectTitle: project?.title || null,
        viewedAt: view.viewedAt,
        relativeDate: relativeDateFr(view.viewedAt, now, { timeZone }),
      }
    })
}

export function topProjectsByViews(projects, limit = 5) {
  return projects
    .slice()
    .sort((first, second) => second.views - first.views || first.title.localeCompare(second.title, 'fr') || String(first.id).localeCompare(String(second.id)))
    .slice(0, limit)
}

export function studentMetrics(views, projects, studentId, { now = new Date(), users = [], timeZone } = {}) {
  const referenceDate = validDate(now) || new Date()
  const ownProjects = projects.filter((project) => project.ownerId === studentId)
  const validViews = validStudentViews(views, projects, studentId, { now: referenceDate, users })
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
  const currentVisibility = currentProfileViews + currentProjectViews
  const previousVisibility = previousProfileViews + previousProjectViews
  const daily = dailyVisibility(views, projects, studentId, { now: referenceDate, users, timeZone })

  return {
    published: ownProjects.filter((project) => project.published).length,
    profileViews: profileViews.length,
    projectViews: projectViews.length,
    uniqueRecruiters: new Set(validViews.map((view) => view.viewerId)).size,
    byProject,
    topProject: byProject.find((project) => project.views > 0) || null,
    validViews,
    weekly,
    weeklyTotal: weekly.reduce((total, week) => total + week.total, 0),
    daily,
    dailyTotal: daily.reduce((total, day) => total + day.total, 0),
    visibilityComparison: { current: currentVisibility, previous: previousVisibility },
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
