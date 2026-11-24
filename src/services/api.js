import { apiClient, apiError } from './api/client'

async function request(config) {
  try {
    const response = await apiClient(config)
    return response.status === 204 ? null : response.data
  } catch (error) {
    throw apiError(error)
  }
}

export const api = {
  getAll: (resource) => request({ url: `/${resource}`, method: 'GET' }),
  create: (resource, entity) => request({ url: `/${resource}`, method: 'POST', data: entity }),
  update: (resource, id, entity) => request({ url: `/${resource}/${id}`, method: 'PUT', data: entity }),
  remove: (resource, id) => request({ url: `/${resource}/${id}`, method: 'DELETE' }),
}
