"use client";

import { fetchMarkets } from "@/lib/client-api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { MarketCard } from "./market-card";

export function MarketsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["markets"],
      queryFn: ({ pageParam }) => fetchMarkets(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.hasNextPage ? lastPageParam + 1 : undefined,
    });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const markets = data.pages.flatMap((p) => p.markets);

  if (markets.length === 0) {
    return <p className="text-muted-foreground text-sm">No markets found.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market, i) => (
          <MarketCard key={market.id} market={market} imagePriority={i < 6} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Loading more…</p>
      )}
    </>
  );
}
