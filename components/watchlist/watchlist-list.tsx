'use client'

import { fetchWatchedMarkets } from '@/lib/markets/client-api'
import { useWatchlist } from '@/lib/watchlist/hooks'
import { useQuery } from '@tanstack/react-query'
import { AlertRuleList } from '../alerts/alert-rule-list'
import { MarketCard } from '../markets/market-card'
import { GridVirtualizer } from '../ui/grid-virtualizer'
import { GridSkeleton } from '../ui/grid-skeleton'

export function WatchlistList() {
  const { entries } = useWatchlist()
  const ids = entries.map((e) => e.marketId)
  const sortedIds = [...ids].sort()

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['watchlist-markets', sortedIds],
    queryFn: () => fetchWatchedMarkets(ids),
    enabled: ids.length > 0,
    refetchInterval: 30_000,
    staleTime: 25_000,
    placeholderData: (prev) => prev,
  })

  if (isLoading) {
    return <GridSkeleton />
  }

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">No markets on your watchlist yet. Star a market to add it.</p>
  }

  const visibleMarkets = markets.filter((m) => ids.includes(m.id))

  return (
    <GridVirtualizer
      items={visibleMarkets}
      renderItem={(item, i, rowIndex, cols) => (
        <>
          <MarketCard market={item} imagePriority={rowIndex === 0 && i < cols} />
          <AlertRuleList market={item} />
        </>
      )}
      itemKey="id"
    />
  )
}
