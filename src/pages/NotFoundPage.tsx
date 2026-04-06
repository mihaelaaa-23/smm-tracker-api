import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-2">
        <span className="text-8xl font-bold tracking-tight text-gray-900 dark:text-white">404</span>
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Page not found</p>
        <p className="text-sm text-gray-400 dark:text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  )
}