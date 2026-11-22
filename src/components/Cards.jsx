import { ArrowUpRight, Bookmark, Code2, Eye, Heart, MapPin, MoreHorizontal, Sparkles } from './icons'
import { Link } from 'react-router-dom'
import { availabilityLabel, isAvailable } from '../utils/profile'

export function ProjectVisual({ visual = 'violet', title = '' }) {
  return <div className={`project-visual visual-${visual}`} aria-hidden="true"><span className="visual-orb one" /><span className="visual-orb two" /><span className="visual-panel" /><span className="visual-label">{title.slice(0, 2).toUpperCase() || 'PH'}</span></div>
}

export function ProjectCard({ project, owner, views = 0, favorite, onFavorite, editable = false, onDelete }) {
  return <article className="project-card">
    <ProjectVisual visual={project.visual} title={project.title} />
    <div className="project-card-body">
      <div className="project-card-top"><span className="tag muted">{project.category}</span>{editable ? <span className={`tag ${project.published ? 'accent' : 'muted'}`}>{project.published ? 'Publié' : 'Brouillon'}</span> : onFavorite && <button className={`icon-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label="Ajouter aux favoris"><Bookmark size={18} fill={favorite ? 'currentColor' : 'none'} /></button>}</div>
      <Link to={`/projets/${project.id}`}><h3>{project.title}</h3></Link>
      <p>{project.description}</p>
      <div className="tech-list">{project.technologies.slice(0, 3).map((technology) => <span key={technology}>{technology}</span>)}</div>
      <div className="project-card-footer">{owner && <Link className="owner-line" to={`/profils/${owner.id}`}><span className={`mini-avatar avatar-${owner.accent}`}>{owner.avatar}</span>{owner.name}</Link>}<span className="view-count"><Eye size={15} />{views}</span></div>
      {editable && <div className="card-actions"><Link to={`/etudiant/projets/${project.id}/modifier`} className="button compact secondary">Modifier</Link><button className="button compact danger-quiet" onClick={onDelete}>Supprimer</button></div>}
    </div>
  </article>
}

export function TalentCard({ student, projectsCount, favorite, onFavorite }) {
  const available = isAvailable(student)
  return <article className="talent-card"><div className="talent-cover"><span className="cover-wave" /><button className={`icon-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label="Ajouter le profil aux favoris"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="talent-body"><div className={`avatar avatar-large avatar-${student.accent}`}>{student.avatar}</div><div className="talent-heading"><h3>{student.name}</h3><p>{student.title}</p></div><span className={`availability ${available ? '' : 'unavailable'}`}><Sparkles size={13} />{availabilityLabel(student)}</span><div className="location"><MapPin size={14} />{student.location}</div><div className="tech-list">{student.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="talent-footer"><span><Code2 size={15} />{projectsCount} projets</span><Link className="text-link" to={`/profils/${student.id}`}>Voir le profil <ArrowUpRight size={15} /></Link></div></div></article>
}
