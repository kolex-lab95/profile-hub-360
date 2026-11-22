function timestamp(value) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function distinctRecentProfiles(events, recruiterId) {
  const latestByStudent = new Map()
  events
    .filter((event) => event.recruiterId === recruiterId && event.studentId)
    .forEach((event) => {
      const current = latestByStudent.get(event.studentId)
      if (!current || timestamp(event.viewedAt) > timestamp(current.viewedAt)) latestByStudent.set(event.studentId, event)
    })
  return [...latestByStudent.values()].sort((a, b) => timestamp(b.viewedAt) - timestamp(a.viewedAt))
}
