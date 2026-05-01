"use client";

import { fetchMarkets } from "@/lib/client-api";
import { marketsSearchParsers } from "@/lib/markets/search-params";
import type { MarketWithSignals } from "@/lib/markets/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useColumnCount } from "@/lib/use-column-count";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useQueryStates } from "nuqs";
import { ErrorComponent } from "./error";
import { MarketCard } from "./market-card";


type VirtualListProps = {
  markets: MarketWithSignals[];
  cols: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
};

function MarketsVirtualList({
  markets,
  cols,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  error
}: VirtualListProps) {
  const rowCount = Math.ceil(markets.length / cols);

  const [scrollMargin, setScrollMargin] = useState(0);
  const listRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollMargin(el.offsetTop);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 350,
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
    if (shouldFetch) fetchNextPage();
  }, [shouldFetch, fetchNextPage]);

  return (
    <>
      <div
        ref={listRef}
        style={{ height: virtualizer.getTotalSize(), position: "relative" }}
      >
        {virtualRows.map((virtualRow) => {
          const startIdx = virtualRow.index * cols;
          const rowMarkets = markets.slice(startIdx, startIdx + cols);

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
                {rowMarkets.map((market, i) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    imagePriority={virtualRow.index === 0 && i < cols}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {isFetchingNextPage && !error && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Loading more…
        </p>
      )}
      {error && <ErrorComponent error={error} onRetry={fetchNextPage} />}
    </>
  );
}

export function MarketsList() {
  const [{ order, liquidity_num_min }] = useQueryStates(marketsSearchParsers);
  const queryKey = ["markets", order, liquidity_num_min];

  const { data, fetchNextPage, hasNextPage, error, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchMarkets(pageParam, { order, liquidity_num_min }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor
    });

  const cols = useColumnCount();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const markets = data.pages.flatMap((p) => p.markets);

  if (markets.length === 0) {
    return <p className="text-muted-foreground text-sm">No markets found.</p>;
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market, i) => (
          <MarketCard key={market.id} market={market} imagePriority={i < 6} />
        ))}
      </div>
    );
  }

  return (
    <MarketsVirtualList
      key={`${cols}-${order}-${liquidity_num_min}`}
      markets={markets}
      cols={cols}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      error={error}
    />
  );
}
