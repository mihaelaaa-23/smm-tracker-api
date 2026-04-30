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

export async function importData(file: File): Promise<{ imported: number; errors: string[] }> {
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

  const errors: string[] = []
  let imported = 0

  // Upsert clients
  for (const client of parsed.clients) {
    try {
      const { id, ...rest } = client as any
      await db.clients.add({ ...rest, createdAt: new Date(rest.createdAt) })
      imported++
    } catch {
      errors.push(`Skipped duplicate client: ${(client as any).name}`)
    }
  }

  // Upsert tasks
  for (const task of parsed.tasks) {
    try {
      const { id, ...rest } = task as any
      await db.tasks.add({ ...rest, createdAt: new Date(rest.createdAt) })
      imported++
    } catch {
      errors.push(`Skipped duplicate task: ${(task as any).title}`)
    }
  }

  // Upsert payments
  for (const payment of parsed.payments) {
    try {
      const { id, ...rest } = payment as any
      await db.payments.add(rest)
      imported++
    } catch {
      errors.push(`Skipped duplicate payment`)
    }
  }

  return { imported, errors }
}