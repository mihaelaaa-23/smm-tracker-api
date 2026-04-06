import { Trash2, Pencil, Mail } from 'lucide-react'
import type { Payment, Client } from '../../types'
import { formatPeriod } from '../../db'

interface PaymentListProps {
    payments: Payment[]
    clients: Client[]
    onDelete: (id: number) => void
    onEdit: (payment: Payment) => void
    onAddForClient: (clientId: number) => void
}

const statusStyles: Record<Payment['status'], { dot: string; text: string; bg: string }> = {
    paid: {
        dot: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    unpaid: {
        dot: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/30',
    },
    partial: {
        dot: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
}

export default function PaymentList({ payments, clients, onDelete, onEdit }: PaymentListProps) {
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
        const subject = encodeURIComponent(`Payment reminder — ${formatPeriod(payment.month, payment.year)}`)
        const body = encodeURIComponent(
            `Hi ${client.name},\n\nThis is a friendly reminder that your payment of ${payment.amount.toLocaleString()} ${payment.currency} for ${formatPeriod(payment.month, payment.year)} is still outstanding.\n\nPlease let me know when you've processed it.\n\nThank you!`
        )
        window.open(`mailto:?subject=${subject}&body=${body}`)
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            {payments.map((payment, i) => {
                const client = getClient(payment.clientId)
                const style = statusStyles[payment.status]
                const isLast = i === payments.length - 1

                return (
                    <div
                        key={payment.id}
                        className={`group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${!isLast ? 'border-b border-gray-50 dark:border-zinc-800' : ''
                            }`}
                    >
                        {/* Client info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {client?.name ?? 'Unknown'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {client?.brand}
                                    {payment.date && ` · ${new Date(payment.date).toLocaleDateString('en-GB')}`}
                                </p>
                                {payment.status === 'unpaid' && new Date(payment.date) < new Date() && (
                                    <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded shrink-0">
                                        {Math.floor((new Date().getTime() - new Date(payment.date).getTime()) / (1000 * 60 * 60 * 24))}d overdue
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {payment.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                                {payment.currency}
                            </span>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 w-20 flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${style.text} ${style.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                {payment.status}
                            </span>
                        </div>

                        {/* Notes */}
                        <div className="hidden md:block w-32 shrink-0">
                            {payment.notes && (
                                <span className="text-xs text-gray-300 dark:text-gray-600 truncate block">
                                    {payment.notes}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="w-20 flex items-center justify-end gap-0.5 shrink-0">
                            {payment.status !== 'paid' && (
                                <button
                                    onClick={() => handleEmailReminder(payment, client)}
                                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                                    title="Send payment reminder"
                                >
                                    <Mail size={13} />
                                </button>
                            )}
                            <button
                                onClick={() => onEdit(payment)}
                                className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Pencil size={13} />
                            </button>
                            <button
                                onClick={() => onDelete(payment.id!)}
                                className="p-1.5 rounded-lg text-gray-300 dark:text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}