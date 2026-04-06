import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { paymentsDB, clientsDB, formatPeriod } from '../db'
import PaymentList from '../components/payments/PaymentList'
import PaymentForm from '../components/payments/PaymentForm'
import PaymentSummary from '../components/payments/PaymentSummary'
import type { Payment } from '../types'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'

type FilterStatus = 'all' | 'paid' | 'unpaid' | 'partial'

export default function PaymentsPage() {
  const qc = useQueryClient()
  const now = new Date()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [preselectedClientId, setPreselectedClientId] = useState<number | null>(null)
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const { confirm, dialogProps } = useConfirm()

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentsDB.getAll,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsDB.getAll,
  })

  const addMutation = useMutation({
    mutationFn: (data: Omit<Payment, 'id'>) => paymentsDB.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Payment> }) =>
      paymentsDB.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentsDB.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  const handleSubmit = (data: Omit<Payment, 'id'>) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id!, changes: data })
    } else {
      addMutation.mutate(data)
    }
    setShowForm(false)
    setEditing(null)
    setPreselectedClientId(null)
  }

  const handleEdit = (payment: Payment) => {
    setEditing(payment)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete payment',
      message: 'This will permanently delete this payment entry.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) deleteMutation.mutate(id)
  }

  const handleAddForClient = (clientId: number) => {
    setEditing(null)
    setPreselectedClientId(clientId)
    setShowForm(true)
  }

  const navigateMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir
    let y = viewYear
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setViewMonth(m)
    setViewYear(y)
  }

  // Filter payments for current view month
  const monthPayments = payments.filter(p => p.month === viewMonth && p.year === viewYear)

  // Apply status + search filters
  const filtered = monthPayments
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => {
      if (!search) return true
      const client = clients.find(c => c.id === p.clientId)
      return client?.name.toLowerCase().includes(search.toLowerCase()) ||
        client?.brand.toLowerCase().includes(search.toLowerCase())
    })

  return (
    <div className="flex flex-col gap-6 pb-24">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {formatPeriod(viewMonth, viewYear)} · {monthPayments.length} clients
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setPreselectedClientId(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Payment
        </button>
      </div>

      {/* Filter bar + search */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {(['all', 'paid', 'unpaid', 'partial'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${filterStatus === s
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search client..."
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-sm text-gray-400 dark:text-gray-600">Loading...</div>
      ) : (
        <PaymentList
          payments={filtered}
          clients={clients}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddForClient={handleAddForClient}
        />
      )}

      {/* Summary bar */}
      <PaymentSummary
        payments={monthPayments}
        viewMonth={viewMonth}
        viewYear={viewYear}
        onNavigate={navigateMonth}
      />

      {/* Modal */}
      {showForm && (
        <PaymentForm
          initial={editing ?? undefined}
          clients={clients}
          preselectedClientId={preselectedClientId ?? undefined}
          preselectedMonth={viewMonth}
          preselectedYear={viewYear}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null); setPreselectedClientId(null) }}
        />
      )}

      {dialogProps.open && (
        <ConfirmDialog {...dialogProps} />
      )}

    </div>
  )
}