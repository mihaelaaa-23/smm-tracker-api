function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-xl ${className}`} />
  )
}

export function ClientCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center pt-3 border-t border-gray-50 dark:border-zinc-800">
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function RowSkeleton({ cols = 3 }: { cols?: number }) {
  const widths = ['w-32', 'w-20', 'w-16', 'w-24', 'w-28']
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 dark:border-zinc-800 last:border-0">
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className={`h-6 ${widths[i % widths.length]} rounded-full shrink-0`} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-14" />
    </div>
  )
}
