import { BarChart3, Bookmark, BriefcaseBusiness, Compass, FolderKanban, House, LogOut, Palette, Search, Settings, UserRound } from './icons'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Brand } from './Brand'

const studentLinks = [
  { to: '/etudiant', label: 'Vue d’ensemble', icon: House, end: true },
  { to: '/etudiant/projets', label: 'Mes projets', icon: FolderKanban },
  { to: '/etudiant/statistiques', label: 'Statistiques', icon: BarChart3 },
  { to: '/etudiant/profil', label: 'Mon portfolio', icon: UserRound },
]
const recruiterLinks = [
  { to: '/recruteur', label: 'Vue d’ensemble', icon: House, end: true },
  { to: '/recruteur/recherche', label: 'Trouver des talents', icon: Search },
  { to: '/recruteur/favoris', label: 'Mes favoris', icon: Bookmark },
]

export function AppLayout({ children }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const links = user.role === 'student' ? studentLinks : recruiterLinks
  const roleLabel = user.role === 'student' ? 'Espace étudiant' : 'Espace recruteur'
  const handleLogout = () => { logout(); navigate('/') }
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to={user.role === 'student' ? '/etudiant' : '/recruteur'} className="brand-link"><Brand /></Link>
      <div className="role-pill"><BriefcaseBusiness size={15} />{roleLabel}</div>
      <nav className="side-nav" aria-label="Navigation principale">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19} />{label}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/parametres" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings size={19} />Paramètres</NavLink>
        <button className="nav-item logout" onClick={handleLogout}><LogOut size={19} />Se déconnecter</button>
        <div className="user-chip"><div className={`avatar avatar-${user.accent}`}>{user.avatar}</div><div><strong>{user.name}</strong><span>{user.title}</span></div></div>
      </div>
    </aside>
    <header className="mobile-top"><Link to="/" aria-label="Accueil"><Brand compact /></Link><span>{roleLabel}</span><NavLink to="/parametres" aria-label="Paramètres"><Palette size={20} /></NavLink></header>
    <main className="app-main">{children}</main>
    <nav className="bottom-nav" aria-label="Navigation mobile">
      {links.slice(0, 4).map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={20} /><span>{label.replace('Vue d’ensemble', 'Accueil').replace('Trouver des talents', 'Talents')}</span></NavLink>)}
      <NavLink to="/parametres"><Settings size={20} /><span>Réglages</span></NavLink>
    </nav>
  </div>
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>
}

export function Notice() {
  const { notice } = useApp()
  return notice ? <div className={`toast ${notice.type}`} role="status">{notice.text}</div> : null
}

export function EmptyState({ icon: Icon = Compass, title, description, action }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={28} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}
