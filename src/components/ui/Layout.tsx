import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import { useTheme } from '../../hooks/useTheme'

export default function Layout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <Navbar toggleTheme={toggleTheme} isDark={isDark} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 ml-0 md:ml-64 mt-16 pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  )
}