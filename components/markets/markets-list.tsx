'use client'

import { fetchMarkets } from '@/lib/client-api'
import { useIsHydrated } from '@/lib/hooks'
import { marketsSearchParsers } from '@/lib/markets/search-params'
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { useEffect, useMemo } from 'react'
import { GridVirtualizer } from '../ui/grid-virtualizer'
import { MarketCard } from './market-card'

export function MarketsList() {
  const [params] = useQueryStates(marketsSearchParsers)
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => {
    const { order, liquidity_num_min, closed, uma_resolution_status } = params
    return ['markets', order, liquidity_num_min, closed, uma_resolution_status] as const
  }, [params])

  const queryKeyStr = queryKey.join('-')

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey, exact: true })
    }
  }, [queryKey, queryClient])

  const { data, fetchNextPage, hasNextPage, error, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchMarkets(pageParam, params),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const hydrated = useIsHydrated()

  const markets = data.pages.flatMap((p) => p.markets)

  if (markets.length === 0) {
    return <p className="text-muted-foreground text-sm">No markets found.</p>
  }

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market, i) => (
          <MarketCard key={market.id} market={market} imagePriority={i < 6} />
        ))}
      </div>
    )
  }

  return (
    <>
      <GridVirtualizer
        key={queryKeyStr}
        items={markets}
        renderItem={(item, i, rowIndex, cols) => (
          <MarketCard key={item.id} market={item} imagePriority={rowIndex === 0 && i < cols} />
        )}
        itemKey="id"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        error={error}
      />
    </>
  )
}
