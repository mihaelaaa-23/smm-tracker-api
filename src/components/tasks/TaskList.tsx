import { Pencil, Trash2 } from 'lucide-react'
import type { Task, Client } from '../../types'

interface TaskListProps {
  tasks: Task[]
  clients: Client[]
  onDelete: (id: number) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: number, status: Task['status']) => void
}

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const statusStyles: Record<Task['status'], string> = {
  'todo': 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400',
  'in-progress': 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  'done': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
}

const statusOptions: Task['status'][] = ['todo', 'in-progress', 'done']

export default function TaskList({ tasks, clients, onDelete, onEdit, onStatusChange }: TaskListProps) {
  const getClient = (clientId: number) => clients.find(c => c.id === clientId)

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm mt-1">Add your first task to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
      {tasks.map((task, i) => {
        const client = getClient(task.clientId)
        const deadline = new Date(task.deadline)
        const isOverdue = deadline < new Date() && task.status !== 'done'
        const isLast = i === tasks.length - 1

        return (
          <div
            key={task.id}
            className={`group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
              !isLast ? 'border-b border-gray-50 dark:border-zinc-800' : ''
            }`}
          >
            {/* Task info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {client?.name}
                  {task.needsApproval && ' · Needs approval'}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            {/* Deadline */}
            <span className={`text-xs font-medium shrink-0 hidden sm:block ${
              isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {isOverdue ? 'Overdue · ' : ''}{deadline.toLocaleDateString('en-GB')}
            </span>

            {/* Status */}
            <select
              value={task.status}
              onChange={e => onStatusChange(task.id!, e.target.value as Task['status'])}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer shrink-0 ${statusStyles[task.status]}`}
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(task.id!)}
                className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}