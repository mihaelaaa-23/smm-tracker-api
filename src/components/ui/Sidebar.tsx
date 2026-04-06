import { NavLink } from 'react-router-dom'
import { Users, CheckSquare, CreditCard, LayoutDashboard } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-black border-r border-gray-100 dark:border-zinc-800 hidden md:flex flex-col py-6 px-4 gap-0.5">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${isActive
              ? 'text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-zinc-900'
              : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </aside>
  )
}