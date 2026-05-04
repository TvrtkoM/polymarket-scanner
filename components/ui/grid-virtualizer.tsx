import { useColumnCount } from '@/lib/use-column-count'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { ReactNode, useCallback, useEffect, useState } from 'react'

/**
 * Props for {@link GridVirtualizer}.
 *
 * @typeParam T - The item type. Must have a string-valued field used as the unique key.
 * @typeParam K - The key of `T` whose value is used as the React key for each item.
 */
export interface GridVirtualizerProps<T extends Record<K, string>, K extends keyof T> {
  /** Flat list of items to render in the grid. */
  items: T[]
  /**
   * Renders a single item cell.
   *
   * @param item - The item to render.
   * @param index - The item's position within its row (0-based).
   * @param rowIndex - The virtual row index containing this item.
   * @param cols - The current number of grid columns.
   */
  renderItem: (item: T, index: number, rowIndex: number, cols: number) => ReactNode
  /** The key of `T` whose value uniquely identifies each item. */
  itemKey: K
  /** Called when the virtualizer scrolls near the end of the loaded items. */
  fetchNextPage?: () => void
  /**
   * Whether more pages are available to fetch.
   *
   * @defaultValue false
   */
  hasNextPage?: boolean
  /**
   * Whether a page fetch is currently in flight. Prevents duplicate fetches.
   *
   * @defaultValue false
   */
  isFetchingNextPage?: boolean
  /**
   * An error from the most recent fetch, if any. Suppresses further fetches while set.
   *
   * @defaultValue null
   */
  error?: Error | null
}

/**
 * Virtualizes a responsive grid of items using window-based scrolling.
 * Automatically triggers `fetchNextPage` when the last row comes into view,
 * enabling infinite scroll without a manual load-more action.
 *
 * @typeParam T - The item type. Must have a string-valued field used as the unique key.
 * @typeParam K - The key of `T` whose value is used as the React key for each item.
 */
export function GridVirtualizer<T extends Record<K, string>, K extends keyof T>({
  items,
  renderItem,
  itemKey,
  fetchNextPage,
  isFetchingNextPage = false,
  hasNextPage = false,
  error = null,
}: GridVirtualizerProps<T, K>) {
  const cols = useColumnCount()
  const rowCount = Math.ceil(items.length / cols)
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
  const lastRow = virtualRows.at(-1)

  const shouldFetch = lastRow != null && !error && lastRow.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage

  useEffect(() => {
    if (shouldFetch) fetchNextPage?.()
  }, [shouldFetch, fetchNextPage])

  return (
    <div ref={listRef} style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualRows.map((virtualRow) => {
        const startIdx = virtualRow.index * cols
        const rowItems = items.slice(startIdx, startIdx + cols)

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
              {rowItems.map((item, i) => (
                <div key={item[itemKey]} className="flex flex-col gap-2">
                  {renderItem(item, i, virtualRow.index, cols)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
