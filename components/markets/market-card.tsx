'use client'

import type { MarketWithSignals } from '@/lib/markets/types'
import { formatCurrency, formatDate, formatSignedPercent } from '@/lib/utils'
import Decimal from 'decimal.js'
import Image from 'next/image'
import Link from 'next/link'
import { HorizontalScroller } from '../ui/horizontal-scroller'
import { PolymarketsLink } from '../ui/polymarkets-link'
import { WatchlistIcon } from '../watchlist/watchlist-icon'
import { SignalBadges } from './signals'
import { MarketStatuses } from './market-statuses'

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label}: <span className="font-mono font-medium">{value}</span>
    </span>
  )
}

export function MarketCard({ market, imagePriority = false }: { market: MarketWithSignals; imagePriority?: boolean }) {
  const leadOutcome = market.outcomes[0]
  const leadOutcomePrice = new Decimal(leadOutcome.price)
  const prob = leadOutcomePrice.mul(100).toSignificantDigits(4).toString()
  const change = market.oneDayPriceChange
  const changePositive = change >= 0

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow grow">
      <div className="h-36 relative">
        {market.image && (
          <div className="absolute h-full w-full bg-muted">
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
        <div className="absolute top-2 right-4">
          <MarketStatuses market={market} />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        {market.eventTitle && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">{market.eventTitle}</p>
        )}

        <h2 className="text-sm font-semibold leading-snug line-clamp-2 underline">
          <Link href={`/markets/${market.slug}`} prefetch>
            {market.question}
          </Link>
        </h2>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-2xl font-bold">
            {leadOutcome.label} <span className="font-mono">{prob}%</span>
          </span>
          <span className={`text-xs font-medium font-mono ${changePositive ? 'text-green-600' : 'text-red-500'}`}>
            {formatSignedPercent(change)} 24h
          </span>
        </div>

        <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <StatItem label="Vol 24h" value={formatCurrency(market.volume24h)} />
          <StatItem label="Liq" value={formatCurrency(market.liquidity)} />
          {market.endDate && <StatItem label="End Date" value={formatDate(market.endDate)} />}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 min-w-0">
            {market.signals.length > 0 ? (
              <HorizontalScroller<HTMLDivElement>>
                {(ref) => <SignalBadges ref={ref} signals={market.signals} />}
              </HorizontalScroller>
            ) : (
              <div className="py-0.5 text-xs font-medium">No signals</div>
            )}
          </div>

          <WatchlistIcon market={market} />

          <PolymarketsLink slug={market.slug} />
        </div>
      </div>
    </article>
  )
}
