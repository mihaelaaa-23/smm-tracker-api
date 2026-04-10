import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Star, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { clientsDB, tasksDB, paymentsDB, formatPeriod } from '../db'
import TaskForm from '../components/tasks/TaskForm'
import type { Task } from '../types'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'

const platformColors: Record<string, string> = {
    Instagram: 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400',
    TikTok: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300',
    Facebook: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    LinkedIn: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    YouTube: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    Telegram: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
    Pinterest: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
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

export default function ClientDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const qc = useQueryClient()
    const clientId = Number(id)
    const { confirm, dialogProps } = useConfirm()

    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    const { data: client, isLoading } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => clientsDB.getAll().then(clients => clients.find(c => c.id === clientId)),
    })

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', clientId],
        queryFn: () => tasksDB.getByClient(clientId),
    })

    const { data: payments = [] } = useQuery({
        queryKey: ['payments', clientId],
        queryFn: () => paymentsDB.getByClient(clientId),
    })

    const addTaskMutation = useMutation({
        mutationFn: (data: Omit<Task, 'id'>) => tasksDB.add(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', clientId] })
            qc.invalidateQueries({ queryKey: ['tasks'] })
        },
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, changes }: { id: number; changes: Partial<Task> }) =>
            tasksDB.update(id, changes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', clientId] })
            qc.invalidateQueries({ queryKey: ['tasks'] })
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: (id: number) => tasksDB.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', clientId] })
            qc.invalidateQueries({ queryKey: ['tasks'] })
        },
    })

    const handleTaskSubmit = (data: Omit<Task, 'id' | 'createdAt'>) => {
        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id!, changes: data })
        } else {
            addTaskMutation.mutate({ ...data, createdAt: new Date() })
        }
        setShowTaskForm(false)
        setEditingTask(null)
    }

    if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>
    if (!client) return <div className="text-sm text-gray-400">Client not found.</div>

    const paymentStatusStyles = {
        paid: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        unpaid: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
        partial: { dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
    }

    return (
        <div className="flex flex-col gap-8">

            {/* Back + header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft size={15} />
                    Back to clients
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.brand}</h1>
                            {client.priority && (
                                <Star size={16} className="text-amber-400" fill="currentColor" />
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{client.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${client.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500'
                                }`}>
                                {client.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            {client.platforms.map(p => (
                                <span key={p} className={`text-xs font-medium px-2.5 py-1 rounded-full ${platformColors[p]}`}>
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {client.notes && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">{client.notes}</p>
                )}
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800" />

            {/* Tasks section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Tasks · {tasks.length}
                    </p>
                    <button
                        onClick={() => { setEditingTask(null); setShowTaskForm(true) }}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Plus size={13} />
                        Add task
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-600">No tasks yet.</p>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                        {tasks.map((task, i) => (
                            <div
                                key={task.id}
                                className={`group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${i !== tasks.length - 1 ? 'border-b border-gray-50 dark:border-zinc-800' : ''
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {new Date(task.deadline).toLocaleDateString('en-GB')}
                                        {task.needsApproval && ' · Needs approval'}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${priorityStyles[task.priority]}`}>
                                    {task.priority}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyles[task.status]}`}>
                                    {task.status}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                        onClick={() => { setEditingTask(task); setShowTaskForm(true) }}
                                        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: 'Delete task',
                                                message: 'This will permanently delete the task.',
                                                confirmLabel: 'Delete',
                                                variant: 'danger',
                                            })
                                            if (ok) deleteTaskMutation.mutate(task.id!)
                                        }}                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Blocked invoice indicator */}
            {tasks.some(t => t.needsApproval && t.status !== 'done') && (
                <div className="flex items-center gap-3 px-5 py-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                        <AlertTriangle size={15} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Invoice blocked</p>
                        <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">
                            {tasks.filter(t => t.needsApproval && t.status !== 'done').length} task{tasks.filter(t => t.needsApproval && t.status !== 'done').length > 1 ? 's' : ''} pending approval before invoicing
                        </p>
                    </div>
                </div>
            )}

            {/* Payments section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Payments · {payments.length}
                    </p>
                </div>

                {payments.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-600">No payments yet.</p>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                        {payments.map((payment, i) => {
                            const style = paymentStatusStyles[payment.status]
                            return (
                                <div
                                    key={payment.id}
                                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${i !== payments.length - 1 ? 'border-b border-gray-50 dark:border-zinc-800' : ''
                                        }`}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatPeriod(payment.month, payment.year)}
                                        </p>
                                        {payment.notes && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{payment.notes}</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                                        {payment.amount.toLocaleString()}
                                        <span className="text-xs text-gray-400 ml-1">{payment.currency}</span>
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${style.text} ${style.bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                        {payment.status}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Task form modal */}
            {showTaskForm && (
                <TaskForm
                    initial={editingTask ?? undefined}
                    clients={[client]}
                    onSubmit={handleTaskSubmit}
                    onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
                />
            )}
            {dialogProps.open && (
                <ConfirmDialog {...dialogProps} />
            )}
        </div>
    )
}