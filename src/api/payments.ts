import { apiFetch } from './client'
import type { Payment } from '../types'

export const apiPayments = {
  getAll: (params?: { limit?: number; offset?: number; clientId?: number; status?: string; currency?: string; month?: number; year?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.clientId) query.set('clientId', String(params.clientId))
    if (params?.status) query.set('status', params.status)
    if (params?.currency) query.set('currency', params.currency)
    if (params?.month) query.set('month', String(params.month))
    if (params?.year) query.set('year', String(params.year))
    return apiFetch(`/payments?${query}`)
  },
  getById: (id: number) => apiFetch(`/payments/${id}`),
  create: (data: Omit<Payment, 'id'>) =>
    apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Payment>) =>
    apiFetch(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch(`/payments/${id}`, { method: 'DELETE' }),
}