import { useColumnCount } from "@/lib/use-column-count";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ReactNode, useCallback, useEffect, useState } from "react";

export function GridVirtualizer<
  T extends Record<K, string>,
  K extends keyof T
>({
  items,
  renderItem,
  itemKey,
  fetchNextPage,
  isFetchingNextPage = false,
  hasNextPage = false,
  error = null
}: {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    rowIndex: number,
    cols: number
  ) => ReactNode;
  itemKey: K;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  error?: Error | null;
}) {
  const cols = useColumnCount();
  const rowCount = Math.ceil(items.length / cols);
  const [scrollMargin, setScrollMargin] = useState(0);

  const listRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollMargin(el.offsetTop);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 400,
    overscan: 3,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastRow = virtualRows.at(-1);

  const shouldFetch =
    lastRow != null &&
    !error &&
    lastRow.index >= rowCount - 1 &&
    hasNextPage &&
    !isFetchingNextPage;

  useEffect(() => {
    if (shouldFetch) fetchNextPage?.();
  }, [shouldFetch, fetchNextPage]);

  return (
    <div
      ref={listRef}
      style={{ height: virtualizer.getTotalSize(), position: "relative" }}
    >
      {virtualRows.map((virtualRow) => {
        const startIdx = virtualRow.index * cols;
        const rowItems = items.slice(startIdx, startIdx + cols);

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start - scrollMargin}px)`
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
        );
      })}
    </div>
  );
}
