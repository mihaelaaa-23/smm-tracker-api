import { useDroppable } from '@dnd-kit/core'

interface KanbanColumnProps {
    id: string
    label: string
    count: number
    children: React.ReactNode
}

const columnStyles: Record<string, { dot: string; bg: string }> = {
    'todo': { dot: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-zinc-900/50' },
    'in-progress': { dot: 'bg-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/10' },
    'done': { dot: 'bg-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/10' },
}

export default function KanbanColumn({ id, label, count, children }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id })

    const style = columnStyles[id] ?? columnStyles['todo']

    return (
        <div className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {label}
                    </span>
                </div>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-600">
                    {count}
                </span>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-2 min-h-32 p-2 rounded-2xl transition-colors ${isOver
                        ? 'bg-gray-100 dark:bg-zinc-800'
                        : style.bg
                    }`}
            >
                {children}
            </div>
        </div>
    )
}