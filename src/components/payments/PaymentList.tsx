import { Trash2, Pencil, Mail } from 'lucide-react'
import type { Payment, Client } from '../../types'
import { formatPeriod } from '../../db'
import { useState } from 'react'

interface PaymentListProps {
    payments: Payment[]
    clients: Client[]
    onDelete: (id: number) => void
    onEdit: (payment: Payment) => void
    onAddForClient: (clientId: number) => void
}

const statusStyles: Record<Payment['status'], { dot: string; text: string; bg: string }> = {
    paid: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    unpaid: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
    partial: { dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
}

export default function PaymentList({ payments, clients, onDelete, onEdit }: PaymentListProps) {
    const [warning, setWarning] = useState<string | null>(null)
    const getClient = (clientId: number) => clients.find(c => c.id === clientId)

    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
                <p className="text-lg font-medium">No payments this month</p>
                <p className="text-sm mt-1">Add a payment or navigate to another month</p>
            </div>
        )
    }

    const handleEmailReminder = (payment: Payment, client: Client | undefined) => {
        if (!client) return

        if (!client.email) {
            setWarning(`No email saved for ${client.name}. Add one on the Client detail page.`)
            setTimeout(() => setWarning(null), 4000)
            return
        }

        const subject = encodeURIComponent(`Payment reminder — ${formatPeriod(payment.month, payment.year)}`)
        const body = encodeURIComponent(
            `Hi ${client.name},\n\nThis is a friendly reminder that your payment of ${payment.amount.toLocaleString()} ${payment.currency} for ${formatPeriod(payment.month, payment.year)} is still outstanding.\n\nPlease let me know when you've processed it.\n\nThank you!`
        )
        window.open(`mailto:${client.email}?subject=${subject}&body=${body}`)
    }

    return (
        <>
            {warning && (
                <div className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {warning}
                </div>
            )}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                {payments.map((payment, i) => {
                    const client = getClient(payment.clientId)
                    const style = statusStyles[payment.status]
                    const isLast = i === payments.length - 1
                    const daysOverdue = payment.status === 'unpaid' && new Date(payment.date) < new Date()
                        ? Math.floor((new Date().getTime() - new Date(payment.date).getTime()) / (1000 * 60 * 60 * 24))
                        : null

                    return (
                        <div
                            key={payment.id}
                            className={`group px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${!isLast ? 'border-b border-gray-50 dark:border-zinc-800' : ''
                                }`}
                        >
                            {/* Mobile layout */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {client?.name ?? 'Unknown'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                        {client?.brand}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {payment.amount.toLocaleString()}
                                        <span className="text-xs text-gray-400 ml-1 font-normal">{payment.currency}</span>
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize ${style.text} ${style.bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                        {payment.status}
                                    </span>
                                </div>
                            </div>

                            {/* Second row — date, overdue, actions */}
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {payment.date && new Date(payment.date).toLocaleDateString('en-GB')}
                                    </span>
                                    {daysOverdue !== null && (
                                        <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                                            {daysOverdue}d overdue
                                        </span>
                                    )}
                                    {payment.notes && (
                                        <span className="text-xs text-gray-300 dark:text-gray-600 truncate hidden md:block max-w-32">
                                            {payment.notes}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {payment.status !== 'paid' && (
                                        <button
                                            onClick={() => handleEmailReminder(payment, client)}
                                            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-blue-500 transition-all"
                                            title="Send payment reminder"
                                        >
                                            <Mail size={13} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit(payment)}
                                        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(payment.id!)}
                                        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}