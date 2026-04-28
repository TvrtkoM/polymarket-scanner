import { MarketsList } from "@/components/markets-list";
import { getMarkets } from "@/lib/markets/get-markets";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata = { title: "Markets" };

async function Markets() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["markets"],
    queryFn: () => getMarkets(),
    initialPageParam: undefined
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketsList />
    </HydrationBoundary>
  );
}

export default function MarketsPage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Markets</h1>
      <Markets />
    </>
  );
}
