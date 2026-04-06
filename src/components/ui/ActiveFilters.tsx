import { X, SlidersHorizontal } from 'lucide-react'

interface ActiveFilter {
  label: string
  onRemove: () => void
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onClearAll: () => void
}

export default function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal size={13} className="text-gray-300 dark:text-gray-400" />
      {filters.map((filter, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="text-gray-300 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-300 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-400 transition-colors underline underline-offset-2"
      >
        Remove all
      </button>
    </div>
  )
}