import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Payment } from '../../types'
import { formatPeriod } from '../../db'

interface PaymentSummaryProps {
  payments: Payment[]
  viewMonth: number
  viewYear: number
  onNavigate: (dir: 1 | -1) => void
}

export default function PaymentSummary({ payments, viewMonth, viewYear, onNavigate }: PaymentSummaryProps) {
  const collectedMDL = payments
    .filter(p => p.currency === 'MDL' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const collectedUSD = payments
    .filter(p => p.currency === 'USD' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingMDL = payments
    .filter(p => p.currency === 'MDL' && p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingUSD = payments
    .filter(p => p.currency === 'USD' && p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const overdueCount = payments.filter(p => p.status === 'unpaid').length

  const totalMDL = payments
    .filter(p => p.currency === 'MDL')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalUSD = payments
    .filter(p => p.currency === 'USD')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 flex-wrap overflow-x-auto">

      {/* Month navigation */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onNavigate(-1)}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-27.5 text-center">
          {formatPeriod(viewMonth, viewYear)}
        </span>
        <button
          onClick={() => onNavigate(1)}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="w-px h-7 bg-gray-100 dark:bg-zinc-800" />

      {/* Total billed */}
      <div className="flex flex-col shrink-0">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total billed</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {totalMDL > 0 && `${totalMDL.toLocaleString()} MDL`}
          {totalMDL > 0 && totalUSD > 0 && <span className="text-gray-400 font-normal"> + </span>}
          {totalUSD > 0 && `${totalUSD} USD`}
          {totalMDL === 0 && totalUSD === 0 && '—'}
        </span>
      </div>

      <div className="w-px h-7 bg-gray-100 dark:bg-zinc-800" />

      {/* Collected */}
      <div className="flex flex-col shrink-0">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Collected</span>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {collectedMDL > 0 && `${collectedMDL.toLocaleString()} MDL`}
          {collectedMDL > 0 && collectedUSD > 0 && <span className="text-gray-400 font-normal"> + </span>}
          {collectedUSD > 0 && `${collectedUSD} USD`}
          {collectedMDL === 0 && collectedUSD === 0 && '—'}
        </span>
      </div>

      <div className="w-px h-7 bg-gray-100 dark:bg-zinc-800" />

      {/* Outstanding */}
      <div className="flex flex-col shrink-0">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Outstanding</span>
        <span className={`text-sm font-bold ${pendingMDL + pendingUSD > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
          {pendingMDL > 0 && `${pendingMDL.toLocaleString()} MDL`}
          {pendingMDL > 0 && pendingUSD > 0 && <span className="text-gray-400 font-normal"> + </span>}
          {pendingUSD > 0 && `${pendingUSD} USD`}
          {pendingMDL === 0 && pendingUSD === 0 && '—'}
        </span>
      </div>

      {overdueCount > 0 && (
        <>
          <div className="w-px h-7 bg-gray-100 dark:bg-zinc-800" />
          <div className="flex flex-col shrink-0">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overdue</span>
            <span className="text-sm font-bold text-red-500 dark:text-red-400">{overdueCount} clients</span>
          </div>
        </>
      )}
    </div>
  )
}