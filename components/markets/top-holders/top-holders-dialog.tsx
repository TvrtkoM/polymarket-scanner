'use client'

import { ErrorComponent } from '@/components/error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { sectionHeadingClassName } from '@/components/ui/section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchMarketHolders } from '@/lib/markets/client-api'
import type { Holder, MarketWithSignals } from '@/lib/markets/types'
import { cn } from '@/lib/utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useState } from 'react'
import { HolderRow, HolderRowPlaceholder } from './holder-row'

const PAGE_SIZE = 20
const ROW_HEIGHT = 56

const OUTCOME_AMOUNT_CLASSES = ['text-emerald-600', 'text-red-600']

function ColumnHeader({ label, index }: { label: string; index: number }) {
  return (
    <div className={'flex items-baseline justify-between py-2'}>
      <span className="text-sm font-semibold">{label} holders</span>
      <span className={cn('text-xs uppercase tracking-wide text-muted-foreground', { 'mr-3': index === 1 })}>
        Shares
      </span>
    </div>
  )
}

export function TopHoldersDialog({
  market,
  open,
  onOpenChange,
}: {
  market: MarketWithSignals
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const conditionId = market.conditionId
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['holders', conditionId],
    queryFn: ({ pageParam }) => fetchMarketHolders(conditionId!, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.some((g) => g.holders.length === PAGE_SIZE) ? pages.length * PAGE_SIZE : undefined,
    enabled: open && conditionId != null,
    refetchInterval: 60000,
  })

  const holdersByOutcome: Holder[][] = useMemo(() => {
    const cols: Holder[][] = market.outcomes.map(() => [])
    if (!data) return cols
    for (const page of data.pages) {
      for (const group of page) {
        for (const holder of group.holders) {
          if (cols[holder.outcomeIndex]) cols[holder.outcomeIndex].push(holder)
        }
      }
    }
    return cols
  }, [data, market.outcomes])

  const maxLen = Math.max(0, ...holdersByOutcome.map((c) => c.length))

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: maxLen,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems.at(-1)
  const shouldFetch = lastItem != null && !error && lastItem.index >= maxLen - 5 && hasNextPage && !isFetchingNextPage

  useEffect(() => {
    if (shouldFetch) fetchNextPage()
  }, [shouldFetch, fetchNextPage])

  const cols = market.outcomes.length
  const gridCols = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-1'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className={sectionHeadingClassName}>Top Holders</DialogTitle>
        </DialogHeader>

        <div>
          <div className={cn('grid gap-x-6 bg-popover border-b mt-auto', gridCols)}>
            {market.outcomes.map((outcome, i) => (
              <ColumnHeader key={outcome.label} label={outcome.label} index={i} />
            ))}
          </div>
          <div ref={setScrollEl} className="h-[60vh] overflow-y-auto">
            {error ? (
              <ErrorComponent error={error} onRetry={() => refetch()} />
            ) : isLoading ? (
              <div className={cn('grid gap-x-6', gridCols)}>
                {market.outcomes.map((outcome) => (
                  <div key={outcome.label} className="flex flex-col gap-2 py-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : maxLen === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">No holders yet.</p>
            ) : (
              <div className={cn('relative grid gap-x-6', gridCols)} style={{ height: virtualizer.getTotalSize() }}>
                {virtualItems.map((virtualRow) => (
                  <div
                    key={virtualRow.key}
                    className={cn('col-span-full grid gap-x-6 absolute top-0 left-0 w-full', gridCols)}
                    style={{ transform: `translateY(${virtualRow.start}px)`, height: virtualRow.size }}
                  >
                    {holdersByOutcome.map((column, i) => {
                      const holder = column[virtualRow.index]
                      return holder ? (
                        <HolderRow
                          key={`${i}-${holder.proxyWallet}`}
                          holder={holder}
                          amountClassName={OUTCOME_AMOUNT_CLASSES[i] ?? ''}
                        />
                      ) : (
                        <HolderRowPlaceholder key={`${i}-empty-${virtualRow.index}`} />
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
