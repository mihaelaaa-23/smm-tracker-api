import { useQuery } from '@tanstack/react-query'
import { clientsDB, tasksDB, paymentsDB, formatPeriod } from '../db'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'

export default function DashboardPage() {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: clientsDB.getAll,
    })

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: tasksDB.getAll,
    })

    const { data: payments = [] } = useQuery({
        queryKey: ['payments'],
        queryFn: paymentsDB.getAll,
    })

    const activeClients = clients.filter(c => c.status === 'active').length
    const pendingTasks = tasks.filter(t => t.status !== 'done').length
    const currentMonthPayments = payments.filter(p => p.month === currentMonth && p.year === currentYear)
    const unpaidCount = currentMonthPayments.filter(p => p.status !== 'paid').length
    const collectedMDL = currentMonthPayments
        .filter(p => p.currency === 'MDL' && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)
    const collectedUSD = currentMonthPayments
        .filter(p => p.currency === 'USD' && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)

    const stats = [
        {
            label: 'Active Clients',
            value: String(activeClients),
            sub: `${clients.length} total`,
            highlight: false,
        },
        {
            label: 'Pending Tasks',
            value: String(pendingTasks),
            sub: `${tasks.length} total`,
            highlight: false,
        },
        {
            label: 'Collected',
            value: collectedMDL > 0 ? `${collectedMDL.toLocaleString()} MDL` : collectedUSD > 0 ? `${collectedUSD} USD` : '—',
            sub: formatPeriod(currentMonth, currentYear),
            highlight: false,
        },
        {
            label: 'Unpaid',
            value: String(unpaidCount),
            sub: 'this month',
            highlight: unpaidCount > 0,
        },
    ]

    // Revenue last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(currentYear, currentMonth - 1 - (5 - i))
        return { month: d.getMonth() + 1, year: d.getFullYear() }
    })

    const revenueData = last6Months.map(({ month, year }) => {
        const monthPayments = payments.filter(p => p.month === month && p.year === year)
        const billed = monthPayments.filter(p => p.currency === 'MDL').reduce((s, p) => s + p.amount, 0)
        const collected = monthPayments.filter(p => p.currency === 'MDL' && p.status === 'paid').reduce((s, p) => s + p.amount, 0)
        return {
            name: new Date(year, month - 1).toLocaleString('en-US', { month: 'short' }),
            Billed: billed,
            Collected: collected,
        }
    })

    // Payment status donut
    const paidCount = currentMonthPayments.filter(p => p.status === 'paid').length
    const unpaidCountChart = currentMonthPayments.filter(p => p.status === 'unpaid').length
    const partialCount = currentMonthPayments.filter(p => p.status === 'partial').length

    const donutData = [
        { name: 'Paid', value: paidCount, color: '#10b981' },
        { name: 'Unpaid', value: unpaidCountChart, color: '#ef4444' },
        { name: 'Partial', value: partialCount, color: '#f59e0b' },
    ].filter(d => d.value > 0)

    // Tasks due this week
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const tasksDueThisWeek = tasks
        .filter(t => {
            const d = new Date(t.deadline)
            return d >= startOfWeek && d <= endOfWeek && t.status !== 'done'
        })
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

    // Unpaid payments current month
    const unpaidPayments = currentMonthPayments.filter(p => p.status !== 'paid')

    const priorityStyles: Record<string, string> = {
        low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }

    return (
        <div className="flex flex-col gap-8">

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                    >
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                            {stat.label}
                        </span>
                        <span className={`text-3xl font-bold tracking-tight ${stat.highlight
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                            }`}>
                            {stat.value}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {stat.sub}
                        </span>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue bar chart */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                        Revenue — last 6 months (MDL)
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueData} barGap={4}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    color: '#f5f5f5',
                                }}
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                            />
                            <Bar dataKey="Billed" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment status donut */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                        Payment status — {formatPeriod(currentMonth, currentYear)}
                    </p>
                    {donutData.length === 0 ? (
                        <div className="h-50 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
                            No payments this month
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#18181b',
                                        border: '1px solid #27272a',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#f5f5f5',
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => (
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Tasks due this week */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                        Tasks due this week · {tasksDueThisWeek.length}
                    </p>
                    {tasksDueThisWeek.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-600 py-4">No tasks due this week.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-50 dark:divide-zinc-800">
                            {tasksDueThisWeek.map(task => {
                                const client = clients.find(c => c.id === task.clientId)
                                return (
                                    <div key={task.id} className="flex items-center gap-3 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{client?.name}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${priorityStyles[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                            {new Date(task.deadline).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Unpaid payments */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                        Unpaid this month · {unpaidPayments.length}
                    </p>
                    {unpaidPayments.length === 0 ? (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 py-4">All clients paid this month.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-50 dark:divide-zinc-800">
                            {unpaidPayments.map(payment => {
                                const client = clients.find(c => c.id === payment.clientId)
                                return (
                                    <div key={payment.id} className="flex items-center gap-3 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {client?.name ?? 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{client?.brand}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                                            {payment.amount.toLocaleString()}
                                            <span className="text-xs text-gray-400 ml-1 font-normal">{payment.currency}</span>
                                        </span>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${payment.status === 'unpaid'
                                            ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                            : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}