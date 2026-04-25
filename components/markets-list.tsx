"use client";

import { fetchMarkets } from "@/lib/client-api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MarketCard } from "./market-card";

export function MarketsList() {
  const { data, isPending, isError, error } = useSuspenseQuery({
    queryKey: ["markets"],
    queryFn: () => fetchMarkets()
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl border border-border bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive text-sm">
        Failed to load markets: {error.message}
      </div>
    );
  }

  const markets = data.markets;

  if (markets.length === 0) {
    return <p className="text-muted-foreground text-sm">No markets found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((market, i) => (
        <MarketCard key={market.id} market={market} imagePriority={i < 6} />
      ))}
    </div>
  );
}
