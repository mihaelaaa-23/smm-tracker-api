import Dexie, { type EntityTable } from 'dexie'
import type { Client, Task, Payment } from '../types'

const db = new Dexie('SMMTrackerDB') as Dexie & {
  clients: EntityTable<Client, 'id'>
  tasks: EntityTable<Task, 'id'>
  payments: EntityTable<Payment, 'id'>
}

db.version(2).stores({
  clients: '++id, name, status, priority, createdAt',
  tasks: '++id, clientId, status, priority, deadline, createdAt',
  payments: '++id, clientId, status, month, year, date',
})

db.version(3).stores({
  clients: '++id, name, status, priority, email, createdAt',
  tasks: '++id, clientId, status, priority, deadline, createdAt',
  payments: '++id, clientId, status, month, year, date',
})

// Client operations
export const clientsDB = {
  getAll: () => db.clients.orderBy('createdAt').reverse().toArray(),
  add: (client: Omit<Client, 'id'>) => db.clients.add(client),
  update: (id: number, changes: Partial<Client>) => db.clients.update(id, changes),
  delete: (id: number) => db.clients.delete(id),
  togglePriority: (id: number, priority: boolean) => db.clients.update(id, { priority }),
}

// Task operations
export const tasksDB = {
  getAll: () => db.tasks.orderBy('createdAt').reverse().toArray(),
  getByClient: (clientId: number) => db.tasks.where('clientId').equals(clientId).toArray(),
  add: (task: Omit<Task, 'id'>) => db.tasks.add(task),
  update: (id: number, changes: Partial<Task>) => db.tasks.update(id, changes),
  delete: (id: number) => db.tasks.delete(id),
}

// Payment operations
export const paymentsDB = {
  getAll: () => db.payments.orderBy('date').reverse().toArray(),
  getByClient: (clientId: number) => db.payments.where('clientId').equals(clientId).toArray(),
  add: (payment: Omit<Payment, 'id'>) => db.payments.add(payment),
  update: (id: number, changes: Partial<Payment>) => db.payments.update(id, changes),
  delete: (id: number) => db.payments.delete(id),
}

export const formatPeriod = (month: number, year: number): string => {
  return new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export { db }