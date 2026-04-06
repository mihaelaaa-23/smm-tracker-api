import { NavLink } from 'react-router-dom'
import { Users, CheckSquare, CreditCard } from 'lucide-react'

const links = [
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col p-4 gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}