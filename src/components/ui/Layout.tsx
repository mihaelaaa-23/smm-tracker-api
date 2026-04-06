import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useTheme } from '../../hooks/useTheme'

export default function Layout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Navbar toggleTheme={toggleTheme} isDark={isDark} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-0 md:ml-64 mt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}