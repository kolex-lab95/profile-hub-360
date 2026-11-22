import { BarChart3, Bookmark, BriefcaseBusiness, Compass, FolderKanban, House, LogOut, MessageCircle, Palette, PanelLeftClose, PanelLeftOpen, Search, Settings, UserRound } from './icons'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Brand } from './Brand'
import { unreadCount } from '../utils/messaging'
import { favoriteCountForUser } from '../utils/favorites'

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
  const { user, logout, favorites, messages, conversations } = useApp()
  const navigate = useNavigate()
  const links = user.role === 'student' ? studentLinks : recruiterLinks
  const navigation = [...links, { to: '/messages', label: 'Messages', icon: MessageCircle }]
  const mobileNavigation = user.role === 'student' ? [...links.slice(0, 3), navigation.at(-1)] : navigation
  const roleLabel = user.role === 'student' ? 'Espace étudiant' : 'Espace recruteur'
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('portfolio-hub-sidebar-collapsed') === 'true')
  const favoritesCount = user.role === 'recruiter' ? favoriteCountForUser(favorites, user.id) : 0
  const messagesCount = unreadCount(messages, conversations, user.id)
  const handleLogout = () => { logout(); navigate('/') }
  const toggleCollapsed = () => setCollapsed((value) => { localStorage.setItem('portfolio-hub-sidebar-collapsed', String(!value)); return !value })
  const navigationItem = ({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} data-tooltip={label} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19} /><span className="nav-label">{label}</span>{to === '/recruteur/favoris' && favoritesCount > 0 && <b className="nav-badge favorites-badge">{favoritesCount}</b>}{to === '/messages' && messagesCount > 0 && <b className="nav-badge messages-badge">{messagesCount}</b>}</NavLink>
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand-row"><Link to={user.role === 'student' ? '/etudiant' : '/recruteur'} className="brand-link" aria-label="Portfolio Hub"><Brand compact={collapsed} /></Link><button className="sidebar-toggle" onClick={toggleCollapsed} aria-label={collapsed ? 'Déployer la barre latérale' : 'Réduire la barre latérale'} aria-pressed={collapsed}><span className="toggle-expanded"><PanelLeftClose size={18} /></span><span className="toggle-collapsed"><PanelLeftOpen size={18} /></span></button></div>
      <div className="role-pill"><BriefcaseBusiness size={15} />{roleLabel}</div>
      <nav className="side-nav" aria-label="Navigation principale">
        {navigation.map(navigationItem)}
      </nav>
      <div className="sidebar-bottom">
        {navigationItem({ to: '/parametres', label: 'Paramètres', icon: Settings })}
        <button className="nav-item logout" data-tooltip="Se déconnecter" onClick={handleLogout}><LogOut size={19} /><span className="nav-label">Se déconnecter</span></button>
        <div className="user-chip"><div className={`avatar avatar-${user.accent}`}>{user.avatar}</div><div><strong>{user.name}</strong><span>{user.title}</span></div></div>
      </div>
    </aside>
    <header className="mobile-top"><Link to="/" aria-label="Accueil"><Brand compact /></Link><span>{roleLabel}</span><NavLink to="/parametres" aria-label="Paramètres"><Palette size={20} /></NavLink></header>
    <main className="app-main">{children}</main>
    <nav className="bottom-nav" aria-label="Navigation mobile">
      {mobileNavigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}><span className="bottom-icon"><Icon size={20} />{to === '/messages' && messagesCount > 0 && <b className="bottom-badge">{messagesCount}</b>}{to === '/recruteur/favoris' && favoritesCount > 0 && <b className="bottom-badge">{favoritesCount}</b>}</span><span>{label.replace('Vue d’ensemble', 'Accueil').replace('Trouver des talents', 'Talents')}</span></NavLink>)}
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
