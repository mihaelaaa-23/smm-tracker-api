import { NavLink } from 'react-router-dom'
import { Users, CheckSquare, CreditCard, LayoutDashboard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { paymentsDB } from '../../db'

export default function Sidebar() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentsDB.getAll,
    staleTime: 0,
  })

  const overdueCount = payments.filter(p =>
    p.month === currentMonth &&
    p.year === currentYear &&
    p.status === 'unpaid' &&
    new Date(p.date) < now
  ).length

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { to: '/clients', label: 'Clients', icon: Users, badge: 0 },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: 0 },
    { to: '/payments', label: 'Payments', icon: CreditCard, badge: overdueCount },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-black border-r border-gray-100 dark:border-gray-900 hidden md:flex flex-col py-6 px-4 gap-0.5">
      {links.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${isActive
              ? 'text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-gray-900'
              : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </aside>
  )
}