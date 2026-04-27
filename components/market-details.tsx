"use client";

import { fetchMarket } from "@/lib/client-api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function MarketDetails({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["market", slug],
    queryFn: () => fetchMarket(slug)
  });

  return (
    <h1 className="mb-8 text-3xl font-bold tracking-tight">
      {data.market.question}
    </h1>
  );
}
