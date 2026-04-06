import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, CreditCard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { paymentsDB } from '../../db'

export default function MobileNav() {
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-colors relative ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}