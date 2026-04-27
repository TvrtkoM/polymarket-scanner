"use client";

import { fetchMarkets } from "@/lib/client-api";
import type { MarketWithSignals } from "@/lib/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { MarketCard } from "./market-card";
import { ErrorComponent } from "./error";

function getColCount() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

function subscribeToColCount(cb: () => void) {
  const smQuery = window.matchMedia("(min-width: 640px)");
  const lgQuery = window.matchMedia("(min-width: 1024px)");
  smQuery.addEventListener("change", cb);
  lgQuery.addEventListener("change", cb);
  return () => {
    smQuery.removeEventListener("change", cb);
    lgQuery.removeEventListener("change", cb);
  };
}

function useColumnCount() {
  return useSyncExternalStore(subscribeToColCount, getColCount, () => 1);
}

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

  useEffect(() => {
    const lastRow = virtualRows.at(-1);
    if (!lastRow || error) return;
    if (lastRow.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    virtualRows,
    rowCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error
  ]);

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
  const { data, fetchNextPage, hasNextPage, error, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["markets"],
      queryFn: ({ pageParam }) => fetchMarkets(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.hasNextPage ? lastPageParam + 1 : undefined
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
    <>
      <MarketsVirtualList
        key={cols}
        markets={markets}
        cols={cols}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        error={error}
      />
    </>
  );
}
