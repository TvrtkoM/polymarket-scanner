'use client'

import { useWatchlist } from '@/lib/watchlist/hooks'
import type { Market } from '@/lib/markets/types'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useCallback } from 'react'

type WatchlistStarProps = {
  market: Pick<Market, 'id' | 'slug' | 'question'>
  className?: string
}

/**
 * Toggle button that adds or removes a market from the watchlist.
 * Renders a filled star when watched, outline star otherwise.
 */
export function WatchlistStar({ market, className }: WatchlistStarProps) {
  const { isWatched, add, remove } = useWatchlist()
  const watched = isWatched(market.id)

  const toggle = useCallback(() => {
    if (watched) {
      remove(market.id)
    } else {
      add({ marketId: market.id, slug: market.slug, question: market.question })
    }
  }, [watched, market, add, remove])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-pressed={watched}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-1.5 transition-colors',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        watched && 'text-amber-500 hover:text-amber-600',
        className,
      )}
    >
      <Star className={cn('size-4', watched && 'fill-current')} />
    </button>
  )
}
