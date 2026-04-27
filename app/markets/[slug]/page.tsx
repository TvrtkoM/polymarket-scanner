import { MarketDetails } from "@/components/market-details";
import { getMarket } from "@/lib/markets";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

async function Market({ slug }: { slug: string }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["market", slug],
    queryFn: () => getMarket(slug)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketDetails slug={slug} />
    </HydrationBoundary>
  );
}

export default async function MarketPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  return <Market slug={slug} />;
}
