import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, CircleAlert, MapPin, Plus, Sparkles, X } from './icons'
import { useApp } from '../context/AppContext'
import { AppLayout, PageHeader } from './Layout'
import { availabilityLabel, isAvailable } from '../utils/profile'

const asForm = (user) => ({
  name: user.name || '',
  title: user.title || '',
  location: user.location || '',
  bio: user.bio || '',
  skills: user.skills || [],
  githubUrl: user.githubUrl || '',
  linkedInUrl: user.linkedInUrl || '',
  availabilityStatus: user.availabilityStatus || 'available',
  company: user.company || '',
})

const RequiredMark = () => <span className="required-mark" aria-hidden="true">*</span>

function isProfessionalUrl(value) {
  if (!value) return true
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' } catch { return false }
}

export function ProfileEditorPage() {
  const { user, updateCurrentUser } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => asForm(user))
  const [skillDraft, setSkillDraft] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const initialRef = useRef(JSON.stringify(asForm(user)))
  const isStudent = user.role === 'student'
  const dirty = JSON.stringify(form) !== initialRef.current
  const preview = { ...user, ...form, availability: form.availabilityStatus === 'unavailable' ? 'Indisponible' : 'Disponible' }

  useEffect(() => {
    const warn = (event) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const addSkill = () => {
    const value = skillDraft.trim().replace(/,+$/, '')
    if (!value || form.skills.some((skill) => skill.toLocaleLowerCase() === value.toLocaleLowerCase())) return setSkillDraft('')
    update('skills', [...form.skills, value]); setSkillDraft('')
  }
  const removeSkill = (skill) => update('skills', form.skills.filter((item) => item !== skill))
  const cancel = () => {
    if (!dirty || window.confirm('Vos modifications non enregistrées seront perdues. Continuer ?')) navigate(-1)
  }
  const save = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Indiquez un nom d’au moins deux caractères.'
    if (form.title.trim().length < 2) nextErrors.title = 'Indiquez une fonction ou un titre professionnel.'
    if (form.bio.trim().length < 12) nextErrors.bio = 'Présentez-vous en au moins douze caractères.'
    if (isStudent && !isProfessionalUrl(form.githubUrl)) nextErrors.githubUrl = 'Utilisez une URL GitHub valide.'
    if (isStudent && !isProfessionalUrl(form.linkedInUrl)) nextErrors.linkedInUrl = 'Utilisez une URL LinkedIn valide.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    const updates = isStudent ? {
      ...form,
      name: form.name.trim(), title: form.title.trim(), location: form.location.trim(), bio: form.bio.trim(),
      availability: form.availabilityStatus === 'unavailable' ? 'Indisponible' : 'Disponible',
    } : {
      name: form.name.trim(), title: form.title.trim(), location: form.location.trim(), bio: form.bio.trim(), company: form.company.trim(),
    }
    try {
      const updated = await updateCurrentUser(updates)
      initialRef.current = JSON.stringify(asForm(updated))
      navigate(isStudent ? `/profils/${updated.id}` : '/recruteur')
    } finally { setSaving(false) }
  }

  return <AppLayout><PageHeader eyebrow="Votre identité" title="Modifier mon profil" description="Les informations enregistrées sont immédiatement répercutées dans les espaces concernés." /><form className="profile-editor" onSubmit={save}><aside className="profile-preview panel"><span className="eyebrow">Aperçu</span><div className="profile-preview-cover"><span /><span /></div><div className={`avatar profile-preview-avatar avatar-${user.accent}`}>{user.avatar}</div><span className={`availability ${isAvailable(preview) ? '' : 'unavailable'}`}><Sparkles size={13} />{availabilityLabel(preview)}</span><h2>{form.name || 'Votre nom'}</h2><p>{form.title || 'Votre fonction'}</p><span className="location"><MapPin size={15} />{form.location || 'Votre localisation'}</span>{!isStudent && form.company && <span className="company-badge preview-company"><Building2 size={13} />{form.company}</span>}<div className="tech-list large">{isStudent ? form.skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>) : <span>{form.company || 'Votre organisation'}</span>}</div></aside><section className="panel profile-form"><div className="profile-form-heading"><span className="eyebrow">Informations publiques</span><p>Les champs ci-dessous sont visibles dans votre profil et les espaces adaptés à votre rôle.</p></div><div className="form-row"><label>Nom complet <RequiredMark /><input value={form.name} onChange={(event) => update('name', event.target.value)} />{errors.name && <small className="field-error">{errors.name}</small>}</label><label>{isStudent ? <>Titre professionnel <RequiredMark /></> : <>Fonction professionnelle <RequiredMark /></>}<input value={form.title} onChange={(event) => update('title', event.target.value)} />{errors.title && <small className="field-error">{errors.title}</small>}</label></div>{!isStudent && <label>Entreprise<input value={form.company} onChange={(event) => update('company', event.target.value)} placeholder="Ex. NovaLabs" /></label>}<label>Localisation<input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Ville, pays" /></label><label>{isStudent ? <>Présentation personnelle <RequiredMark /></> : <>Présentation professionnelle <RequiredMark /></>}<textarea rows="5" value={form.bio} onChange={(event) => update('bio', event.target.value)} />{errors.bio && <small className="field-error">{errors.bio}</small>}</label>{isStudent && <><section className="profile-availability"><div><strong>Disponibilité professionnelle</strong><p>{form.availabilityStatus === 'available' ? 'Vous êtes affiché·e comme disponible auprès des recruteurs.' : 'Votre profil reste visible, avec le statut indisponible.'}</p></div><button type="button" className={`switch ${form.availabilityStatus === 'available' ? 'on' : ''}`} role="switch" aria-checked={form.availabilityStatus === 'available'} onClick={() => update('availabilityStatus', form.availabilityStatus === 'available' ? 'unavailable' : 'available')}><span /></button><b>{form.availabilityStatus === 'available' ? 'Disponible' : 'Indisponible'}</b></section><section className="skills-editor"><strong>Compétences</strong><p>Ajoutez les compétences qui représentent votre profil actuel.</p><div className="skills-input"><input value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addSkill() } }} placeholder="Ex. TypeScript" /><button type="button" className="button secondary compact" onClick={addSkill}><Plus size={15} />Ajouter</button></div><div className="editable-skills">{form.skills.map((skill) => <span key={skill}>{skill}<button type="button" onClick={() => removeSkill(skill)} aria-label={`Supprimer ${skill}`}><X size={13} /></button></span>)}</div></section><div className="form-row"><label>Lien GitHub<input type="url" value={form.githubUrl} onChange={(event) => update('githubUrl', event.target.value)} placeholder="https://github.com/…" />{errors.githubUrl && <small className="field-error">{errors.githubUrl}</small>}</label><label>Lien LinkedIn<input type="url" value={form.linkedInUrl} onChange={(event) => update('linkedInUrl', event.target.value)} placeholder="https://linkedin.com/in/…" />{errors.linkedInUrl && <small className="field-error">{errors.linkedInUrl}</small>}</label></div></>}<div className="profile-editor-actions"><button type="button" className="button secondary" onClick={cancel}>Annuler</button><button className="button primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le profil'}<CheckCircle2 size={17} /></button></div></section></form></AppLayout>
}
