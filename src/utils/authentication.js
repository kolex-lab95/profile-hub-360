export function matchingAccount(users, email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  return users.find((user) => user.email.toLowerCase() === normalizedEmail && user.password === password) || null
}

export function emailIsAvailable(users, email) {
  const normalizedEmail = email.trim().toLowerCase()
  return !users.some((user) => user.email.toLowerCase() === normalizedEmail)
}

export function accountFromSignup(form, id) {
  const initials = form.name.trim().split(/\s+/).map((item) => item[0]).join('').slice(0, 2).toUpperCase() || 'PH'
  const isCandidate = form.role === 'student'
  return {
    id,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    role: form.role,
    title: isCandidate ? 'Candidat·e en construction de portfolio' : 'Recruteur·se',
    location: 'À renseigner',
    bio: 'Ce profil présente ses réalisations et ses compétences.',
    skills: [],
    availability: isCandidate ? 'Disponible' : '',
    avatar: initials,
    accent: isCandidate ? 'coral' : 'blue',
  }
}
