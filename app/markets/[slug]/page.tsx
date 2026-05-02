import { MarketDetails } from "@/components/markets/market-details";
import { getMarket } from "@/lib/markets/get-markets";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getMarketCached = cache(getMarket);

export async function generateMetadata({ params }: PageProps) {
  const slug = (await params).slug;
  try {
    const data = await getMarketCached(slug);

    return {
      title: data?.question ?? "404 - Not found"
    };
  } catch {
    return {
      title: "404 - Not found"
    };
  }
}

async function Market({ slug }: { slug: string }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["market", slug],
    queryFn: () => getMarketCached(slug)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketDetails slug={slug} />
    </HydrationBoundary>
  );
}

export default async function MarketPage({ params }: PageProps) {
  const slug = (await params).slug;

  return <Market slug={slug} />;
}
