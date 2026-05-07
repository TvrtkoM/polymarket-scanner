import { MarketsFiltersSkeleton } from '@/components/markets/markets-filters-skeleton'
import { GridSkeleton } from '@/components/ui/grid-skeleton'

export default function Loading() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Markets</h1>
      <MarketsFiltersSkeleton />
      <div className="mt-8">
        <GridSkeleton />
      </div>
    </>
  )
}
