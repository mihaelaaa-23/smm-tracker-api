import { Sun, Moon } from 'lucide-react'

interface NavbarProps {
  toggleTheme: () => void
  isDark: boolean
}

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-8">
      <span className="text-base font-bold tracking-widest uppercase text-gray-900 dark:text-white">
        SMM Tracker
      </span>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  )
}