import { useEffect, useMemo, useState } from 'react'
import { recentStudentActivity } from '../utils/analytics'
import { useTranslation } from '../i18n/I18n'

export function RecentActivity({ views, projects, users, studentId }) {
  const { locale } = useTranslation()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])
  const activities = useMemo(
    () => recentStudentActivity(views, projects, studentId, { now, users, locale }),
    [views, projects, studentId, users, now, locale],
  )
  return <article className="panel measurement-note activity-panel"><div className="activity-heading"><h3>Activité récente</h3></div>{activities.length ? <div className="activity-list">{activities.map((activity) => <div className="activity-item" key={activity.id}><span className={`mini-avatar avatar-${activity.visitor?.accent || 'blue'}`}>{activity.visitor?.avatar || '·'}</span><div><strong>{activity.visitorName}</strong><span>{activity.type === 'project' ? <>A consulté « {activity.projectTitle} »</> : 'A consulté votre profil'}</span></div><time dateTime={activity.viewedAt}>{activity.relativeDate}</time></div>)}</div> : <p className="activity-empty">Aucune consultation valide n’a encore été enregistrée.</p>}</article>
}
