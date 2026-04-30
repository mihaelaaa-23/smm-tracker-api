import { useState, useRef } from 'react'
import { X, Download, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { exportData, importData } from '../../utils/dataTransfer'

interface Props {
  onClose: () => void
}

type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

export default function DataTransferModal({ onClose }: Props) {
  const [status, setStatus] = useState<Status>({ type: 'idle' })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setStatus({ type: 'loading' })
    try {
      await exportData()
      setStatus({ type: 'success', message: 'Data exported successfully.' })
    } catch {
      setStatus({ type: 'error', message: 'Export failed. Please try again.' })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus({ type: 'loading' })
    try {
      const { imported, errors } = await importData(file)
      const msg = `Imported ${imported} records.${errors.length ? ` ${errors.length} skipped.` : ''}`
      setStatus({ type: 'success', message: msg })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message ?? 'Import failed.' })
    }
    // reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Transfer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Export */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Export</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Downloads all clients, tasks, and payments as a JSON file.
          </p>
          <button
            onClick={handleExport}
            disabled={status.type === 'loading'}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-white dark:text-gray-900 text-sm font-medium transition-colors"
          >
            <Download size={15} />
            Export Backup
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-zinc-800" />

        {/* Import */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Import</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Adds records from a backup file. Existing data is kept — duplicates are skipped.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={status.type === 'loading'}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            <Upload size={15} />
            Import from File
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Status */}
        {status.type === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle size={15} className="shrink-0" />
            {status.message}
          </div>
        )}
        {status.type === 'error' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm font-medium">
            <AlertTriangle size={15} className="shrink-0" />
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}