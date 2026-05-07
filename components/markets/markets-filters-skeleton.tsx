import { Skeleton } from '../ui/skeleton'

export function MarketsFiltersSkeleton() {
  return (
    <div className="flex flex-col space-y-1.5">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-8" />
    </div>
  )
}
