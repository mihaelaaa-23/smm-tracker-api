import type { Task, Client } from '../../types'
import TaskCard from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  clients: Client[]
  onDelete: (id: number) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: number, status: Task['status']) => void
}

export default function TaskList({ tasks, clients, onDelete, onEdit, onStatusChange }: TaskListProps) {
  const getClient = (clientId: number) => clients.find(c => c.id === clientId)

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-400">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm mt-1">Add your first task to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          client={getClient(task.clientId)}
          onDelete={onDelete}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}