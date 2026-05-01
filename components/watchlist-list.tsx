'use client'

import { fetchMarketsByIds } from '@/lib/client-api'
import { useColumnCount } from '@/lib/use-column-count'
import { useWatchlist } from '@/lib/watchlist/hooks'
import type { MarketWithSignals } from '@/lib/markets/types'
import { useQuery } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { MarketCard } from './market-card'
import { AlertRuleList } from './alert-rule-list'

type WatchlistVirtualListProps = {
  markets: MarketWithSignals[]
  cols: number
}

function WatchlistVirtualList({ markets, cols }: WatchlistVirtualListProps) {
  const rowCount = Math.ceil(markets.length / cols)
  const [scrollMargin, setScrollMargin] = useState(0)
  const listRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollMargin(el.offsetTop)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 400,
    overscan: 3,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div
      ref={listRef}
      style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
    >
      {virtualRows.map((virtualRow) => {
        const startIdx = virtualRow.index * cols
        const rowMarkets = markets.slice(startIdx, startIdx + cols)

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
              {rowMarkets.map((market, i) => (
                <div key={market.id} className="flex flex-col gap-2">
                  <MarketCard market={market} imagePriority={virtualRow.index === 0 && i < cols} />
                  <AlertRuleList marketId={market.id} market={market} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WatchlistList() {
  const { entries } = useWatchlist()
  const ids = entries.map((e) => e.marketId)
  const sortedIds = [...ids].sort()

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['watchlist-markets', sortedIds],
    queryFn: () => fetchMarketsByIds(ids),
    enabled: ids.length > 0,
    refetchInterval: 30_000,
    staleTime: 25_000,
  })

  const cols = useColumnCount()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No markets on your watchlist yet. Star a market to add it.
      </p>
    )
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading watchlist…</p>
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <div key={market.id} className="flex flex-col gap-2">
            <MarketCard market={market} />
            <AlertRuleList marketId={market.id} market={market} />
          </div>
        ))}
      </div>
    )
  }

  return <WatchlistVirtualList markets={markets} cols={cols} />
}
