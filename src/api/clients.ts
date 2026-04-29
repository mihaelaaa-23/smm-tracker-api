import { apiFetch } from './client'
import type { Client } from '../types'

export const apiClients = {
  getAll: (params?: { limit?: number; offset?: number; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.status) query.set('status', params.status)
    return apiFetch(`/clients?${query}`)
  },
  getById: (id: number) => apiFetch(`/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'createdAt'>) =>
    apiFetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Client>) =>
    apiFetch(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch(`/clients/${id}`, { method: 'DELETE' }),
}