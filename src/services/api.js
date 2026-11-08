const API_ROOT = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Erreur API (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  getAll: (resource) => request(`/${resource}`),
  create: (resource, entity) => request(`/${resource}`, { method: 'POST', body: entity }),
  update: (resource, id, entity) => request(`/${resource}/${id}`, { method: 'PUT', body: entity }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
}
