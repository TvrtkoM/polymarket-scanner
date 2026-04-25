import { MarketsList } from "@/components/markets-list";
import { getMarkets } from "@/lib/markets";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata = { title: "Markets" };

async function Markets() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["markets"],
    queryFn: () => getMarkets()
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketsList />
    </HydrationBoundary>
  );
}

export default function MarketsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Markets</h1>
      <Markets />
    </main>
  );
}
