"use client";

import { fetchMarkets } from "@/lib/client-api";
import { marketsSearchParsers } from "@/lib/markets/search-params";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useSyncExternalStore } from "react";
import { MarketCard } from "./market-card";
import { GridVirtualizer } from "./ui/grid-virtualizer";

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
      <GridVirtualizer
        key={`${order}-${liquidity_num_min}`}
        items={markets}
        renderItem={(item, i, rowIndex, cols) => (
          <MarketCard
            key={item.id}
            market={item}
            imagePriority={rowIndex === 0 && i < cols}
          />
        )}
        itemKey="id"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        error={error}
      />
    </>
  );
}
