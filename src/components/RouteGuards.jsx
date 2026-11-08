import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function ProtectedRoute({ roles, children }) {
  const { user, status } = useApp()
  const location = useLocation()
  if (status === 'loading') return <div className="center-state"><span className="loader" />Chargement de votre espace…</div>
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/acces-refuse" replace />
  return children
}
