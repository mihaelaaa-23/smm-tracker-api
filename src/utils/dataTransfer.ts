import { db } from '../db'

export const EXPORT_VERSION = 1

export interface ExportData {
  version: number
  exportedAt: string
  clients: object[]
  tasks: object[]
  payments: object[]
}

export async function exportData(): Promise<void> {
  const [clients, tasks, payments] = await Promise.all([
    db.clients.toArray(),
    db.tasks.toArray(),
    db.payments.toArray(),
  ])

  const payload: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    clients,
    tasks,
    payments,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `smm-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<{ imported: number }> {
  const text = await file.text()
  let parsed: ExportData
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Invalid file — could not parse JSON.')
  }
  if (!parsed.version || !Array.isArray(parsed.clients) || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.payments)) {
    throw new Error('Invalid file format — missing required fields.')
  }
  await db.transaction('rw', db.clients, db.tasks, db.payments, async () => {
    await db.clients.clear()
    await db.tasks.clear()
    await db.payments.clear()
    await db.clients.bulkAdd(parsed.clients.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })))
    await db.tasks.bulkAdd(parsed.tasks.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })))
    await db.payments.bulkAdd(parsed.payments as any[])
  })
  const imported = parsed.clients.length + parsed.tasks.length + parsed.payments.length
  return { imported }
}