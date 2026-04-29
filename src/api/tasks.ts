import { apiFetch } from './client'
import type { Task } from '../types'

export const apiTasks = {
  getAll: (params?: { limit?: number; offset?: number; clientId?: number; status?: string; priority?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.clientId) query.set('clientId', String(params.clientId))
    if (params?.status) query.set('status', params.status)
    if (params?.priority) query.set('priority', params.priority)
    return apiFetch(`/tasks?${query}`)
  },
  getById: (id: number) => apiFetch(`/tasks/${id}`),
  create: (data: Omit<Task, 'id' | 'createdAt'>) =>
    apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Task>) =>
    apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
}