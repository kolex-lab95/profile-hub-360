import { useEffect, useMemo, useState } from 'react'
import { Eye } from './icons'
import { recentStudentActivity } from '../utils/analytics'

export function RecentActivity({ views, projects, users, studentId }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])
  const activities = useMemo(
    () => recentStudentActivity(views, projects, studentId, { now, users }),
    [views, projects, studentId, users, now],
  )
  return <article className="panel measurement-note activity-panel"><div className="activity-heading"><span className="icon-orb"><Eye size={21} /></span><div><span className="eyebrow">Dernières consultations</span><h3>Activité récente</h3></div></div>{activities.length ? <div className="activity-list">{activities.map((activity) => <div className="activity-item" key={activity.id}><span className={`mini-avatar avatar-${activity.visitor?.accent || 'blue'}`}>{activity.visitor?.avatar || '·'}</span><div><strong>{activity.visitorName}</strong><span>{activity.type === 'project' ? <>A consulté « {activity.projectTitle} »</> : 'A consulté votre profil'}</span></div><time dateTime={activity.viewedAt}>{activity.relativeDate}</time></div>)}</div> : <p className="activity-empty">Aucune consultation valide n’a encore été enregistrée.</p>}</article>
}
