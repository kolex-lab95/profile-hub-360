import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export function apiError(error) {
  if (axios.isCancel(error)) return error

  const status = error.response?.status
  const detail = error.response?.data
  const message = typeof detail === 'string' && detail.trim()
    ? detail
    : status ? `Erreur API (${status})` : 'Erreur réseau : impossible de joindre l’API.'
  const normalized = new Error(message, { cause: error })
  normalized.status = status
  return normalized
}

export const isRequestCancelled = axios.isCancel
