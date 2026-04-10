import { Trash2, Star, Pencil } from 'lucide-react'
import type { Client } from '../../types'
import { useNavigate } from 'react-router-dom'

interface ClientCardProps {
  client: Client
  onDelete: (id: number) => void
  onTogglePriority: (id: number, priority: boolean) => void
  onEdit: (client: Client) => void
}

const platformColors: Record<string, string> = {
  Instagram: 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400',
  TikTok: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300',
  Facebook: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  LinkedIn: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  YouTube: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  Telegram: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
  Pinterest: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
}

export default function ClientCard({ client, onDelete, onTogglePriority, onEdit }: ClientCardProps) {
  const navigate = useNavigate()
  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-200">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h3
            className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            {client.brand}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">{client.name}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePriority(client.id!, !client.priority)}
            className={`p-1.5 rounded-lg transition-all ${
              client.priority
                ? 'text-amber-400 opacity-100!'
                : 'text-gray-300 dark:text-gray-500 hover:text-amber-400'
            }`}
          >
            <Star size={14} fill={client.priority ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(client.id!)}
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex flex-wrap gap-1.5">
        {client.platforms.map(platform => (
          <span
            key={platform}
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${platformColors[platform]}`}
          >
            {platform}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-zinc-800">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          client.status === 'active'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-400'
        }`}>
          {client.status === 'active' ? 'Active' : 'Inactive'}
        </span>
        {client.notes && (
          <span className="text-xs text-gray-300 dark:text-gray-500 truncate max-w-[55%]">
            {client.notes}
          </span>
        )}
      </div>
    </div>
  )
}