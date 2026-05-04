import { MarketsFilters } from '@/components/markets/markets-filters'
import { MarketsList } from '@/components/markets/markets-list'
import { getMarkets } from '@/lib/markets/get-markets'
import { marketsSearchParamsCache } from '@/lib/markets/search-params'
import { getQueryClient } from '@/lib/query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'

export const metadata = { title: 'Markets' }

type MarketsSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

async function Markets({ searchParams }: { searchParams: MarketsSearchParams }) {
  const queryClient = getQueryClient()
  const params = await marketsSearchParamsCache.parse(searchParams)

  const queryKey: [string, ...unknown[]] = ['markets', params.order, params.liquidity_num_min]

  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: () => getMarkets(params),
    initialPageParam: undefined,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketsList />
    </HydrationBoundary>
  )
}

export default function MarketsPage({ searchParams }: { searchParams: MarketsSearchParams }) {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Markets</h1>
      <Suspense>
        <MarketsFilters />
      </Suspense>
      <div className="mt-8">
        <Markets searchParams={searchParams} />
      </div>
    </>
  )
}
