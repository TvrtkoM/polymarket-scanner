import type { MarketWithSignals } from "@/lib/types";
import { formatCurrency, formatSignedPercent } from "@/lib/utils";
import Image from "next/image";

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

        <p className="text-sm font-semibold leading-snug line-clamp-3">
          {market.question}
        </p>

        {prob !== null && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{prob}%</span>
            <span
              className={`text-xs font-medium ${changePositive ? "text-green-600" : "text-red-500"}`}
            >
              {formatSignedPercent(change)} 24h
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Vol 24h: {formatCurrency(market.volume24h)}</span>
          <span>Liq: {formatCurrency(market.liquidity)}</span>
        </div>

        {market.signals.length > 0 && (
          <ul className="flex flex-wrap gap-1 pt-1">
            {market.signals.map((s) => (
              <li
                key={s.rule}
                title={s.description}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
      </div>
    </article>
  );
}
