export function matchingAccount(users, email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  return users.find((user) => user.email.toLowerCase() === normalizedEmail && user.password === password) || null
}

export function emailIsAvailable(users, email) {
  const normalizedEmail = email.trim().toLowerCase()
  return !users.some((user) => user.email.toLowerCase() === normalizedEmail)
}

export function signupValidationError(users, form) {
  if (!emailIsAvailable(users, form.email)) return 'Cette adresse e-mail est déjà utilisée.'
  if (form.role === 'recruiter' && !form.company?.trim()) return 'Indiquez le nom de votre entreprise.'
  return ''
}

export function dashboardPathForRole(role) {
  if (role === 'student') return '/etudiant'
  if (role === 'recruiter') return '/recruteur'
  return '/'
}

export function publicHeaderAction(user) {
  return user
    ? { path: dashboardPathForRole(user.role), labelKey: 'public.dashboard' }
    : { path: '/connexion', labelKey: 'public.signIn' }
}

export function accountFromSignup(form, id) {
  const initials = form.name.trim().split(/\s+/).map((item) => item[0]).join('').slice(0, 2).toUpperCase() || 'PH'
  const role = form.role === 'recruiter' ? 'recruiter' : 'student'
  const isStudent = role === 'student'
  return {
    id,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    role,
    title: isStudent ? 'Étudiant·e en construction de portfolio' : 'Recruteur·se',
    location: 'À renseigner',
    bio: 'Ce profil présente ses réalisations et ses compétences.',
    skills: [],
    availability: isStudent ? 'Disponible' : '',
    avatar: initials,
    accent: isStudent ? 'coral' : 'blue',
    ...(isStudent ? {} : { company: form.company?.trim() || '' }),
  }
}
