import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, Client } from '../../types'

interface TaskFormProps {
    initial?: Task
    clients: Client[]
    onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void
    onClose: () => void
}

const TYPES: Task['type'][] = ['post', 'story', 'reel', 'content-plan', 'other']
const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high']

export default function TaskForm({ initial, clients, onSubmit, onClose }: TaskFormProps) {
    const [clientId, setClientId] = useState<number>(initial?.clientId ?? clients[0]?.id ?? 0)
    const [title, setTitle] = useState(initial?.title ?? '')
    const [type, setType] = useState<Task['type']>(initial?.type ?? 'post')
    const [deadline, setDeadline] = useState(
        initial?.deadline
            ? new Date(initial.deadline).toISOString().split('T')[0]
            : ''
    )
    const [status, setStatus] = useState<Task['status']>(initial?.status ?? 'todo')
    const [priority, setPriority] = useState<Task['priority']>(initial?.priority ?? 'medium')
    const [description, setDescription] = useState(initial?.description ?? '')
    const [needsApproval, setNeedsApproval] = useState(initial?.needsApproval ?? false)

    const handleSubmit = () => {
        if (!title.trim() || !deadline || !clientId) return
        onSubmit({
            clientId,
            title,
            type,
            deadline: new Date(deadline),
            status,
            priority,
            description,
            needsApproval,
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {initial ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Client */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                    <select
                        value={clientId}
                        onChange={e => setClientId(Number(e.target.value))}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} · {c.brand}</option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. 3 Instagram posts"
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <div className="flex flex-wrap gap-2">
                        {TYPES.map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${type === t
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                            <button
                                key={p}
                                onClick={() => setPriority(p)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${priority === p
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="flex gap-2">
                        {(['todo', 'in-progress', 'done'] as Task['status'][]).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors capitalize ${status === s
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Needs Approval */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Needs approval</label>
                    <button
                        onClick={() => setNeedsApproval(prev => !prev)}
                        className={`w-12 h-6 rounded-full transition-colors ${needsApproval ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-700'
                            }`}
                    >
                        <span className={`block w-5 h-5 rounded-full shadow transition-transform mx-0.5 ${needsApproval ? 'translate-x-6 bg-white dark:bg-zinc-900' : 'translate-x-0 bg-white dark:bg-gray-400'
                            }`} />
                    </button>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Any additional details..."
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
                        disabled={!title.trim() || !deadline || !clientId}
                        className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 text-sm font-medium transition-colors"
                    >
                        {initial ? 'Save Changes' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}