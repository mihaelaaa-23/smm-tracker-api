import { useState } from 'react'
import { X } from 'lucide-react'
import type { Client } from '../../types'

interface ClientFormProps {
  initial?: Client
  onSubmit: (data: Omit<Client, 'id' | 'createdAt'>) => void
  onClose: () => void
}

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Telegram', 'Pinterest'] as const

export default function ClientForm({ initial, onSubmit, onClose }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [platforms, setPlatforms] = useState<Client['platforms']>(initial?.platforms ?? [])
  const [status, setStatus] = useState<Client['status']>(initial?.status ?? 'active')
  const [priority, setPriority] = useState(initial?.priority ?? false)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const togglePlatform = (p: typeof PLATFORMS[number]) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleSubmit = () => {
    if (!name.trim() || !brand.trim()) return
    onSubmit({ name, brand, platforms, status, priority, notes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial ? 'Edit Client' : 'New Client'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ana Constantin"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand / Company</label>
          <input
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="e.g. Florăria Iris"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Platforms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  platforms.includes(p)
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <div className="flex gap-2">
            {(['active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  status === s
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as priority</label>
          <button
            onClick={() => setPriority(prev => !prev)}
            className={`w-12 h-6 rounded-full transition-colors ${
              priority ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
          >
            <span className={`block w-5 h-5 rounded-full shadow transition-transform mx-0.5 ${
              priority ? 'translate-x-6 bg-white dark:bg-zinc-900' : 'translate-x-0 bg-white dark:bg-gray-400'
            }`} />
          </button>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !brand.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 text-sm font-medium transition-colors"
          >
            {initial ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  )
}