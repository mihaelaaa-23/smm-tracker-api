import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2 } from 'lucide-react'
import type { Task, Client } from '../../types'

interface KanbanCardProps {
    task: Task
    client?: Client
    onEdit: (task: Task) => void
    onDelete: (id: number) => void
    onStatusChange: (id: number, status: Task['status']) => void
    isDragging?: boolean
}

const getDaysRemaining = (deadline: Date, status: Task['status']) => {
    if (status === 'done') return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const d = new Date(deadline)
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function KanbanCard({ task, client, onEdit, onDelete, isDragging }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id! })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const daysRemaining = getDaysRemaining(new Date(task.deadline), task.status)

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-all cursor-grab active:cursor-grabbing ${isSortableDragging || isDragging
                ? 'opacity-50 shadow-xl scale-105'
                : 'hover:shadow-md'
                }`}
            {...attributes}
            {...listeners}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                    {task.title}
                </p>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(task) }}
                        className="p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(task.id!) }}
                        className="p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Client */}
            {client && (
                <p className="text-xs text-gray-400 dark:text-gray-500">{client.brand}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'
                        }`} />
                    <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{task.priority}</span>
                    {task.needsApproval && (
                        <span className="text-xs text-orange-500 dark:text-orange-400">· Approval</span>
                    )}
                </div>
                {daysRemaining !== null && (
                    <p className={`text-xs font-medium ${daysRemaining < 0 ? 'text-red-500' :
                            daysRemaining === 0 ? 'text-orange-500' :
                                daysRemaining <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-gray-400 dark:text-gray-600'
                        }`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` :
                            daysRemaining === 0 ? 'Due today' :
                                daysRemaining === 1 ? 'Due tomorrow' :
                                    `${daysRemaining}d left`}
                    </p>
                )}
            </div>
        </div>
    )
}