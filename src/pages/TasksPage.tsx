import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { tasksDB, clientsDB } from '../db'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import KanbanBoard from '../components/tasks/KanbanBoard'
import FilterDropdown from '../components/ui/FilterDropdown'
import ActiveFilters from '../components/ui/ActiveFilters'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import type { Task } from '../types'

type FilterPriority = 'all' | 'low' | 'medium' | 'high'

export default function TasksPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [filterClient, setFilterClient] = useState<number | 'all'>('all')
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const { confirm, dialogProps } = useConfirm()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksDB.getAll,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsDB.getAll,
  })

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

  const clientOptions = [
    { value: 'all', label: 'All clients' },
    ...clients.map(c => ({ value: c.id!, label: c.name })),
  ]

  const filtered = tasks
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .filter(t => filterClient === 'all' || t.clientId === filterClient)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

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
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-colors ${view === 'kanban'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
          ...(filterPriority !== 'all' ? [{ label: filterPriority, onRemove: () => setFilterPriority('all') }] : []),
          ...(filterClient !== 'all' ? [{
            label: clients.find(c => c.id === filterClient)?.name ?? '',
            onRemove: () => setFilterClient('all')
          }] : []),
        ]}
        onClearAll={() => {
          setFilterPriority('all')
          setFilterClient('all')
        }}
      />

      {/* Content */}
      {isLoading ? (
        <div className="text-sm text-gray-400 dark:text-gray-600">Loading...</div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={filtered}
          clients={clients}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

      {/* Confirm dialog */}
      {dialogProps.open && (
        <ConfirmDialog {...dialogProps} />
      )}
    </div>
  )
}