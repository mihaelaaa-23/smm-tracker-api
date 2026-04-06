import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { clientsDB } from '../db'
import ClientList from '../components/clients/ClientList'
import ClientForm from '../components/clients/ClientForm'
import type { Client } from '../types'
import ActiveFilters from '../components/ui/ActiveFilters'
import FilterDropdown from '../components/ui/FilterDropdown'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'

type FilterStatus = 'all' | 'active' | 'inactive'
type FilterPriority = 'all' | 'priority'

export default function ClientsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const { confirm, dialogProps } = useConfirm()

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsDB.getAll,
  })

  const addMutation = useMutation({
    mutationFn: (data: Omit<Client, 'id'>) => clientsDB.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Client> }) =>
      clientsDB.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsDB.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const handleSubmit = (data: Omit<Client, 'id' | 'createdAt'>) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id!, changes: data })
    } else {
      addMutation.mutate({ ...data, createdAt: new Date() })
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleEdit = (client: Client) => {
    setEditing(client)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete client',
      message: 'This will permanently delete the client and cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) deleteMutation.mutate(id)
  }

  const handleTogglePriority = (id: number, priority: boolean) => {
    updateMutation.mutate({ id, changes: { priority } })
  }

  const filtered = clients
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => filterPriority === 'all' || c.priority)

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {clients.length} total · {clients.filter(c => c.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Client
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
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <FilterDropdown
          label="Priority"
          value={filterPriority}
          onChange={v => setFilterPriority(v as FilterPriority)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'priority', label: 'Priority only' },
          ]}
        />
      </div>

      {/* Active filters */}
      <ActiveFilters
        filters={[
          ...(filterStatus !== 'all' ? [{ label: filterStatus, onRemove: () => setFilterStatus('all') }] : []),
          ...(filterPriority !== 'all' ? [{ label: 'Priority', onRemove: () => setFilterPriority('all') }] : []),
        ]}
        onClearAll={() => { setFilterStatus('all'); setFilterPriority('all') }}
      />

      {/* List */}
      {isLoading ? (
        <div className="text-sm text-gray-400 dark:text-gray-400">Loading...</div>
      ) : (
        <ClientList
          clients={filtered}
          onDelete={handleDelete}
          onTogglePriority={handleTogglePriority}
          onEdit={handleEdit}
        />
      )}

      {/* Modal */}
      {showForm && (
        <ClientForm
          initial={editing ?? undefined}
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