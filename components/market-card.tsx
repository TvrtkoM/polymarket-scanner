"use client";

import type { MarketWithSignals } from "@/lib/markets/types";
import { formatCurrency, formatSignedPercent } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { HorizontalScroller } from "./ui/horizontal-scroller";
import { PolymarketsLink } from "./ui/polymarkets-link";

export function MarketCard({
  market,
  imagePriority = false
}: {
  market: MarketWithSignals;
  imagePriority?: boolean;
}) {
  const leadOutcome = market.outcomes[0];
  const prob = leadOutcome ? Math.round(leadOutcome.price * 100) : null;
  const change = market.oneDayPriceChange;
  const changePositive = change >= 0;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {market.image && (
        <div className="relative h-36 w-full bg-muted">
          <Image
            src={market.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 570px, (max-width: 1024px) 470px, 380px"
            priority={imagePriority}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 flex-1">
        {market.eventTitle && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {market.eventTitle}
          </p>
        )}

        <p className="text-sm font-semibold leading-snug line-clamp-2 underline">
          <Link href={`/markets/${market.slug}`} prefetch>
            {market.question}
          </Link>
        </p>

        {prob !== null && (
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold">
              {leadOutcome.label} {prob}%
            </span>
            <span
              className={`text-xs font-medium ${changePositive ? "text-green-600" : "text-red-500"}`}
            >
              {formatSignedPercent(change)} 24h
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Vol 24h: {formatCurrency(market.volume24h)}</span>
          <span>Liq: {formatCurrency(market.liquidity)}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 min-w-0">
            {market.signals.length > 0 ? (
              <HorizontalScroller>
                {(ref) => (
                  <ul
                    ref={ref as React.RefObject<HTMLUListElement>}
                    className="flex gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {market.signals.map((s) => (
                      <li
                        key={s.rule}
                        title={s.description}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : s.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {s.rule}
                      </li>
                    ))}
                  </ul>
                )}
              </HorizontalScroller>
            ) : (
              <div className="py-0.5 text-xs font-medium">No signals</div>
            )}
          </div>

          <PolymarketsLink slug={market.slug} />
        </div>
      </div>
    </article>
  );
}
