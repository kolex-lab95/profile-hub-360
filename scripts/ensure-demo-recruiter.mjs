import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const demoRecruiter = Object.freeze({
  id: 'recruiter-nadia-faye',
  role: 'recruiter',
  name: 'Nadia Faye',
  email: 'nadia@talent.demo',
  password: 'demo123',
  title: 'Talent Partner · Horizon Talent',
  company: 'Horizon Talent',
  location: 'Dakar, Sénégal',
  bio: 'J’accompagne les équipes qui recherchent des profils produit et tech engagés.',
  skills: [],
  availability: '',
  avatar: 'NF',
  accent: 'blue',
})

function normalizedEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function addDemoRecruiter(data) {
  if (!Array.isArray(data?.users)) throw new Error('La collection « users » est introuvable dans db.json.')

  const sameId = data.users.find((user) => user.id === demoRecruiter.id)
  const sameEmail = data.users.find((user) => normalizedEmail(user.email) === demoRecruiter.email)

  if (sameId || sameEmail) {
    if (sameId && sameEmail && sameId === sameEmail) return { created: false, data }
    throw new Error('Impossible d’ajouter Nadia Faye : l’identifiant ou l’e-mail est déjà associé à un autre compte.')
  }

  return { created: true, data: { ...data, users: [...data.users, { ...demoRecruiter }] } }
}

function usersArrayClosingBracket(source) {
  const usersKey = source.indexOf('"users"')
  const openingBracket = source.indexOf('[', usersKey)
  if (usersKey < 0 || openingBracket < 0) throw new Error('La collection « users » est introuvable dans db.json.')

  let depth = 0
  let inString = false
  let escaped = false
  for (let index = openingBracket; index < source.length; index += 1) {
    const character = source[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') inString = true
    else if (character === '[') depth += 1
    else if (character === ']') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  throw new Error('La collection « users » est invalide dans db.json.')
}

export function appendDemoRecruiter(source) {
  const parsed = JSON.parse(source)
  const result = addDemoRecruiter(parsed)
  if (!result.created) return result

  const closingBracket = usersArrayClosingBracket(source)
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const beforeClosingBracket = source.slice(0, closingBracket).replace(/[ \t\r\n]+$/, '')
  const closingIndent = source.slice(0, closingBracket).match(/(?:^|\r?\n)([ \t]*)$/)?.[1] || ''
  const itemIndent = `${closingIndent}  `
  const serializedRecruiter = JSON.stringify(demoRecruiter, null, 2).replace(/\n/g, `${newline}${itemIndent}`)
  const nextSource = `${beforeClosingBracket},${newline}${itemIndent}${serializedRecruiter}${newline}${closingIndent}${source.slice(closingBracket)}`

  return { created: true, data: result.data, source: nextSource }
}

async function main() {
  const dbPath = resolve(process.cwd(), 'db.json')
  const source = await readFile(dbPath, 'utf8')
  const result = appendDemoRecruiter(source)
  if (!result.created) {
    console.log('Le compte de démonstration Nadia Faye existe déjà ; aucune donnée n’a été modifiée.')
    return
  }
  await writeFile(dbPath, result.source, 'utf8')
  console.log('Compte recruteur de démonstration ajouté : Nadia Faye (nadia@talent.demo).')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
