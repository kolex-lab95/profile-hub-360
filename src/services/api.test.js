import { afterEach, describe, expect, it } from 'vitest'
import { api } from './api'
import { apiClient } from './api/client'

const originalAdapter = apiClient.defaults.adapter

function withAdapter(handler) {
  apiClient.defaults.adapter = async (config) => handler(config)
}

afterEach(() => { apiClient.defaults.adapter = originalAdapter })

describe('api service', () => {
  it('uses Axios for GET, POST, PUT and DELETE with unchanged REST paths', async () => {
    const calls = []
    withAdapter((config) => {
      calls.push(config)
      return { data: config.method === 'delete' ? '' : { id: 'item-1' }, status: config.method === 'delete' ? 204 : 200, statusText: 'OK', headers: {}, config }
    })

    await expect(api.getAll('users')).resolves.toEqual({ id: 'item-1' })
    await expect(api.create('projects', { title: 'Atlas' })).resolves.toEqual({ id: 'item-1' })
    await expect(api.update('projects', 'item-1', { title: 'Atlas 2' })).resolves.toEqual({ id: 'item-1' })
    await expect(api.remove('projects', 'item-1')).resolves.toBeNull()

    expect(calls.map(({ method, url, data }) => ({ method, url, data }))).toEqual([
      { method: 'get', url: '/users', data: undefined },
      { method: 'post', url: '/projects', data: JSON.stringify({ title: 'Atlas' }) },
      { method: 'put', url: '/projects/item-1', data: JSON.stringify({ title: 'Atlas 2' }) },
      { method: 'delete', url: '/projects/item-1', data: undefined },
    ])
  })

  it('normalizes HTTP and network failures for the application', async () => {
    withAdapter(() => Promise.reject({ response: { status: 500, data: 'Service indisponible' } }))
    await expect(api.getAll('users')).rejects.toMatchObject({ message: 'Service indisponible', status: 500 })

    withAdapter(() => Promise.reject(new Error('offline')))
    await expect(api.getAll('users')).rejects.toMatchObject({ message: 'Erreur réseau : impossible de joindre l’API.', status: undefined })
  })
})
