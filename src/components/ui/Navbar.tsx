import { Sun, Moon } from 'lucide-react'

interface NavbarProps {
  toggleTheme: () => void
  isDark: boolean
}

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm">
      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
        SMM Tracker
      </span>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}