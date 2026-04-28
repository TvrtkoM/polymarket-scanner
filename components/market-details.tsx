"use client";

import { fetchMarket } from "@/lib/client-api";
import type { MarketWithSignals } from "@/lib/markets/types";
import {
  cn,
  formatCurrency,
  formatDate,
  formatPrice,
  formatSigned
} from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import { SignalBadges } from "./signals";
import { PolymarketsLink } from "./ui/polymarkets-link";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </h2>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  );
}

function MarketDetailsView({ market }: { market: MarketWithSignals }) {
  const isBinary = market.outcomes.length === 2;

  return (
    <div className="space-y-6">
      <div>
        {market.eventTitle && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {market.eventTitle}
          </p>
        )}
        <div className="flex items-center gap-3">
          {market.image && (
            <div className="w-12 h-12 relative">
              <Image
                src={market.image}
                alt=""
                fill
                className="rounded-lg shrink-0 object-cover"
                priority
                sizes="64px"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight flex-1">
            {market.question}
          </h1>
          <PolymarketsLink slug={market.slug} className="self-start" />
        </div>
      </div>

      <section className="flex flex-wrap gap-x-8 gap-y-3 pb-6">
        <Stat label="24h Volume" value={formatCurrency(market.volume24h)} />
        <Stat label="7d Volume" value={formatCurrency(market.volume1wk)} />
        <Stat label="Liquidity" value={formatCurrency(market.liquidity)} />
        <Stat
          label="End Date"
          value={market.endDate ? formatDate(market.endDate) : "-"}
        />
      </section>

      <section>
        <SectionHeading>Description</SectionHeading>
        <p>{market.description}</p>
      </section>

      <section className="border-t pt-6">
        <SectionHeading>Outcomes</SectionHeading>
        <div className="space-y-3">
          {market.outcomes.map((outcome, i) => (
            <div key={outcome.label} className="flex items-center gap-3">
              <span className="text-sm font-medium w-24 shrink-0">
                {outcome.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${outcome.price * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 w-28 justify-end">
                <span className="font-mono font-bold text-sm">
                  {formatPrice(outcome.price)}
                </span>
                {isBinary && i === 0 && market.oneDayPriceChange !== 0 && (
                  <span
                    className={cn(
                      "flex items-center text-xs font-mono",
                      market.oneDayPriceChange > 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {market.oneDayPriceChange > 0 ? (
                      <TrendingUp className="size-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="size-3 mr-0.5" />
                    )}
                    {formatSigned(market.oneDayPriceChange)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t pt-6">
        <SectionHeading>Order Book</SectionHeading>
        <div className="grid grid-cols-3 rounded-lg overflow-hidden text-sm mb-3">
          <div className="bg-emerald-50 dark:bg-emerald-950 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Best Bid</p>
            <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {formatPrice(market.bestBid)}
            </p>
          </div>
          <div className="bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Spread</p>
            <p className="font-mono font-bold">{formatPrice(market.spread)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 px-4 py-3 text-right">
            <p className="text-xs text-muted-foreground mb-1">Best Ask</p>
            <p className="font-mono font-bold text-red-700 dark:text-red-400">
              {formatPrice(market.bestAsk)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last trade:{" "}
          <span className="font-mono">
            {formatPrice(market.lastTradePrice)}
          </span>
        </p>
      </section>

      <section className="border-t pt-6">
        <SectionHeading>Price Movement</SectionHeading>
        <div className="flex gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">24h change</span>
            <span
              className={cn(
                "font-mono font-semibold text-sm",
                market.oneDayPriceChange > 0
                  ? "text-emerald-600"
                  : market.oneDayPriceChange < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              )}
            >
              {formatSigned(market.oneDayPriceChange)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">7d change</span>
            <span
              className={cn(
                "font-mono font-semibold text-sm",
                market.oneWeekPriceChange > 0
                  ? "text-emerald-600"
                  : market.oneWeekPriceChange < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              )}
            >
              {formatSigned(market.oneWeekPriceChange)}
            </span>
          </div>
        </div>
      </section>

      {market.signals.length > 0 && (
        <div className="border-t pt-6">
          <SectionHeading>Signals</SectionHeading>
          <SignalBadges signals={market.signals} />
        </div>
      )}
    </div>
  );
}

export function MarketDetails({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["market", slug],
    queryFn: () => fetchMarket(slug)
  });

  return <MarketDetailsView market={data.market} />;
}
