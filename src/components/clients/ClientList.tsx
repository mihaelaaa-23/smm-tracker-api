import type { Client } from '../../types'
import ClientCard from './ClientCard'

interface ClientListProps {
  clients: Client[]
  onDelete: (id: number) => void
  onTogglePriority: (id: number, priority: boolean) => void
  onEdit: (client: Client) => void
}

export default function ClientList({ clients, onDelete, onTogglePriority, onEdit }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
        <p className="text-lg font-medium">No clients yet</p>
        <p className="text-sm mt-1">Add your first client to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map(client => (
        <ClientCard
          key={client.id}
          client={client}
          onDelete={onDelete}
          onTogglePriority={onTogglePriority}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}