'use client'

import { fetchWatchedMarkets } from '@/lib/client-api'
import { useIsHydrated } from '@/lib/hooks'
import { useWatchlist } from '@/lib/watchlist/hooks'
import { useQuery } from '@tanstack/react-query'
import { AlertRuleList } from '../alerts/alert-rule-list'
import { MarketCard } from '../markets/market-card'
import { GridVirtualizer } from '../ui/grid-virtualizer'

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
  })

  const hydrated = useIsHydrated()

  if (entries.length === 0 && hydrated) {
    return <p className="text-muted-foreground text-sm">No markets on your watchlist yet. Star a market to add it.</p>
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading watchlist…</p>
  }

  return (
    <GridVirtualizer
      items={markets}
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
