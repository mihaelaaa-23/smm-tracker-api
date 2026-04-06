import { Trash2, Pencil } from 'lucide-react'
import type { Task, Client } from '../../types'

interface TaskCardProps {
  task: Task
  client?: Client
  onDelete: (id: number) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: number, status: Task['status']) => void
}

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const typeStyles: Record<Task['type'], string> = {
  post: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  story: 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400',
  reel: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  'content-plan': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const statusOptions: Task['status'][] = ['todo', 'in-progress', 'done']

export default function TaskCard({ task, client, onDelete, onEdit, onStatusChange }: TaskCardProps) {
  const deadline = new Date(task.deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = deadline < today && task.status !== 'done'
  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</h3>
          {client && (
            <span className="text-xs text-gray-400 dark:text-gray-400">{client.name} · {client.brand}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id!)}
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-700 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${typeStyles[task.type]}`}>
          {task.type}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {task.needsApproval && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
            Needs approval
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-400 dark:text-gray-400 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 dark:border-zinc-800">
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-300 dark:text-gray-700'}`}>
          {isOverdue ? 'Overdue · ' : ''}{deadline.toLocaleDateString('en-GB')}
        </span>
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id!, e.target.value as Task['status'])}
          className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
        >
          {statusOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}