import Dexie, { type EntityTable } from 'dexie';
import type { Client, Task, Payment } from '../types';

const db = new Dexie('SMMTrackerDB') as Dexie & {
  clients: EntityTable<Client, 'id'>;
  tasks: EntityTable<Task, 'id'>;
  payments: EntityTable<Payment, 'id'>;
};

db.version(1).stores({
  clients: '++id, name, status, priority, createdAt',
  tasks: '++id, clientId, status, priority, deadline, createdAt',
  payments: '++id, clientId, status, date',
});

export { db };