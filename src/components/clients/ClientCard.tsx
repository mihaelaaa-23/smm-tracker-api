import { Trash2, Star } from 'lucide-react'
import type { Client } from '../../types'

interface ClientCardProps {
  client: Client
  onDelete: (id: number) => void
  onTogglePriority: (id: number, priority: boolean) => void
  onEdit: (client: Client) => void
}

const platformColors: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  TikTok: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  LinkedIn: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
}

export default function ClientCard({ client, onDelete, onTogglePriority, onEdit }: ClientCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3
            className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            onClick={() => onEdit(client)}
          >
            {client.name}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{client.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePriority(client.id!, !client.priority)}
            className={`p-1.5 rounded-lg transition-colors ${
              client.priority
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
            aria-label="Toggle priority"
          >
            <Star size={16} fill={client.priority ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onDelete(client.id!)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Delete client"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex flex-wrap gap-2">
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
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          client.status === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {client.status === 'active' ? 'Active' : 'Inactive'}
        </span>
        {client.notes && (
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[60%]">
            {client.notes}
          </span>
        )}
      </div>
    </div>
  )
}