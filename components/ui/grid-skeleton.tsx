import { Skeleton } from './skeleton'

export function GridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-90" />
      ))}
    </div>
  )
}
