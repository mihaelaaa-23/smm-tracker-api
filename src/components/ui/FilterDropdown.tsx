import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string | number
  label: string
}

interface FilterDropdownProps {
  label: string
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  count?: number
}

export default function FilterDropdown({ label, options, value, onChange, count }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = value !== 'all' && value !== 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
          isActive
            ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-black font-medium'
            : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 font-medium'
        }`}
      >
        <span>{label}</span>
        {isActive && count && (
          <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-black/20 text-xs flex items-center justify-center">
            {count}
          </span>
        )}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-30 py-2 overflow-hidden">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === option.value
                  ? 'text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-zinc-900'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}