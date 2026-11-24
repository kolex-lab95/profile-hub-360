export const MAX_CUSTOM_COVER_BYTES = 5 * 1024 * 1024

const ACCEPTED_TYPES = Object.freeze({
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
})
const COVER_DATABASE = 'portfolio-hub-covers'
const COVER_STORE = 'project-covers'

export function imageFormatFromSignature(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg'
  if (bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return 'png'
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp'
  return null
}

function formatMatchesMime(format, mime) {
  return ACCEPTED_TYPES[format] === mime
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)
    bitmap.close?.()
    return
  }
  if (typeof Image === 'undefined') throw new Error('Décodage image indisponible.')
  const url = URL.createObjectURL(file)
  try {
    await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0 ? resolve() : reject(new Error('Image vide.'))
      image.onerror = () => reject(new Error('Image corrompue.'))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function validateCustomCover(file, { decode = decodeImage } = {}) {
  if (!file) return { valid: false, reason: 'missing' }
  if (!Object.values(ACCEPTED_TYPES).includes(file.type)) return { valid: false, reason: 'type' }
  if (file.size <= 0 || file.size > MAX_CUSTOM_COVER_BYTES) return { valid: false, reason: 'size' }

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const format = imageFormatFromSignature(bytes)
  if (!format || !formatMatchesMime(format, file.type)) return { valid: false, reason: 'content' }

  try {
    await decode(file)
    return { valid: true, format }
  } catch {
    return { valid: false, reason: 'corrupt' }
  }
}

function openCoverDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('Le stockage local des couvertures est indisponible dans ce navigateur.'))
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(COVER_DATABASE, 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => request.result.createObjectStore(COVER_STORE)
    request.onsuccess = () => resolve(request.result)
  })
}

async function runCoverRequest(mode, callback) {
  const database = await openCoverDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const request = callback(database.transaction(COVER_STORE, mode).objectStore(COVER_STORE))
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } finally {
    database.close()
  }
}

export function saveCustomCover(id, file) {
  return runCoverRequest('readwrite', (store) => store.put(file, id))
}

export function loadCustomCover(id) {
  if (!id) return Promise.resolve(null)
  return runCoverRequest('readonly', (store) => store.get(id))
}

export function removeCustomCover(id) {
  if (!id) return Promise.resolve()
  return runCoverRequest('readwrite', (store) => store.delete(id))
}
