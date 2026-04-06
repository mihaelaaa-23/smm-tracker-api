import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { tasksDB, clientsDB } from '../db'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import type { Task } from '../types'
import FilterDropdown from '../components/ui/FilterDropdown'
import ActiveFilters from '../components/ui/ActiveFilters'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'

type FilterStatus = 'all' | 'todo' | 'in-progress' | 'done'
type FilterPriority = 'all' | 'low' | 'medium' | 'high'

export default function TasksPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [filterClient, setFilterClient] = useState<number | 'all'>('all')
  const { confirm, dialogProps } = useConfirm()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksDB.getAll,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsDB.getAll,
  })

  const clientOptions = [
    { value: 'all', label: 'All clients' },
    ...clients.map(c => ({ value: c.id!, label: c.name })),
  ]

  const addMutation = useMutation({
    mutationFn: (data: Omit<Task, 'id'>) => tasksDB.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Task> }) =>
      tasksDB.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksDB.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const handleSubmit = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id!, changes: data })
    } else {
      addMutation.mutate({ ...data, createdAt: new Date() })
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleEdit = (task: Task) => {
    setEditing(task)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete task',
      message: 'This will permanently delete the task.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) deleteMutation.mutate(id)
  }

  const handleStatusChange = (id: number, status: Task['status']) => {
    updateMutation.mutate({ id, changes: { status } })
  }

  const filtered = tasks
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .filter(t => filterClient === 'all' || t.clientId === filterClient)

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {tasks.length} total · {tasks.filter(t => t.status !== 'done').length} pending
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label="Status"
          value={filterStatus}
          onChange={v => setFilterStatus(v as FilterStatus)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'todo', label: 'Todo' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
        />
        <FilterDropdown
          label="Priority"
          value={filterPriority}
          onChange={v => setFilterPriority(v as FilterPriority)}
          options={[
            { value: 'all', label: 'All priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
        <FilterDropdown
          label="Client"
          value={filterClient}
          onChange={v => setFilterClient(v === 'all' ? 'all' : Number(v))}
          options={clientOptions}
        />
      </div>

      {/* Active filters */}
      <ActiveFilters
        filters={[
          ...(filterStatus !== 'all' ? [{ label: filterStatus, onRemove: () => setFilterStatus('all') }] : []),
          ...(filterPriority !== 'all' ? [{ label: filterPriority, onRemove: () => setFilterPriority('all') }] : []),
          ...(filterClient !== 'all' ? [{
            label: clients.find(c => c.id === filterClient)?.name ?? '',
            onRemove: () => setFilterClient('all')
          }] : []),
        ]}
        onClearAll={() => {
          setFilterStatus('all')
          setFilterPriority('all')
          setFilterClient('all')
        }}
      />

      {/* List */}
      {isLoading ? (
        <div className="text-sm text-gray-400 dark:text-gray-400">Loading...</div>
      ) : (
        <TaskList
          tasks={filtered}
          clients={clients}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modal */}
      {showForm && (
        <TaskForm
          initial={editing ?? undefined}
          clients={clients}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {dialogProps.open && (
        <ConfirmDialog {...dialogProps} />
      )}

    </div>
  )
}