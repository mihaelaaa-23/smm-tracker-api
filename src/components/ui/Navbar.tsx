import { Sun, Moon, HardDriveDownload } from 'lucide-react'
import { useState } from 'react'
import DataTransferModal from './DataTransferModal'

interface NavbarProps {
  toggleTheme: () => void
  isDark: boolean
}

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
  const [showTransfer, setShowTransfer] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-8">
      <span className="text-base font-bold tracking-widest uppercase text-gray-900 dark:text-white">
        SMM Tracker
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowTransfer(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Export / Import data"
        >
          <HardDriveDownload size={18} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {showTransfer && <DataTransferModal onClose={() => setShowTransfer(false)} />}
    </header>
  )
}