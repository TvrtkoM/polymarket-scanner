'use client'

import { fetchMarket, fetchMarketDisputes } from '@/lib/markets/client-api'
import type { MarketDisputes, MarketWithSignals } from '@/lib/markets/types'
import { cn, formatCurrency, formatDate, formatPrice, formatSigned } from '@/lib/utils'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { TrendingDown, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { AlertRuleListSection } from '../alerts/alert-rule-list'
import { ClientOnly } from '../client-only'
import { PolymarketsLink } from '../ui/polymarkets-link'
import { SectionHeading } from '../ui/section-heading'
import { Skeleton } from '../ui/skeleton'
import { WatchlistIcon } from '../watchlist/watchlist-icon'
import { MarketStatuses } from './market-statuses'
import { SignalBadges } from './signals'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  )
}

function DisputeTimeline({ disputes }: { disputes: MarketDisputes }) {
  type Node = { key: string; label: string; isDispute: boolean }
  const nodes: Node[] = [
    {
      key: 'proposed-1',
      label: `Price proposed: ${formatPrice(disputes.proposedPrice)}`,
      isDispute: false,
    },
    { key: 'disputed-1', label: 'Disputed', isDispute: true },
    ...(disputes.reproposedPrice !== null
      ? [
          {
            key: 'proposed-2',
            label: `Price proposed: ${formatPrice(disputes.reproposedPrice)}`,
            isDispute: false,
          },
          { key: 'disputed-2', label: 'Disputed', isDispute: true },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col">
      {nodes.map((node, i) => (
        <div key={node.key} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                node.isDispute ? 'border-muted-foreground bg-background' : 'border-sky-500 bg-sky-500',
              )}
            >
              {!node.isDispute && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            {i < nodes.length - 1 && <div className="w-px flex-1 bg-border my-1 min-h-4" />}
          </div>
          <p className={cn('text-sm pb-4', node.isDispute ? 'text-muted-foreground' : 'font-medium font-mono')}>
            {node.label}
          </p>
        </div>
      ))}
    </div>
  )
}

function DisputeTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-7 w-36" />
    </div>
  )
}

function MarketDetailsView({ market }: { market: MarketWithSignals }) {
  const isBinary = market.outcomes.length === 2

  const isDisputed = market.disputed && market.questionId != null

  const { data: disputes, isLoading: isLoadingDisputes } = useQuery({
    queryKey: ['market-disputes', market.questionId],
    queryFn: () => fetchMarketDisputes(market.questionId!),
    enabled: isDisputed,
  })

  return (
    <div className="space-y-6">
      <div>
        {market.eventTitle && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{market.eventTitle}</p>
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
          <h1 className="text-2xl font-bold tracking-tight flex-1">{market.question}</h1>
          <div className="self-start mt-1">
            <MarketStatuses market={market} />
          </div>
          <div className="flex items-center gap-1 self-start">
            <WatchlistIcon market={market} />
            <PolymarketsLink slug={market.slug} />
          </div>
        </div>
      </div>

      <section className="flex flex-wrap gap-x-8 gap-y-3 pb-6">
        <Stat label="24h Volume" value={formatCurrency(market.volume24h)} />
        <Stat label="7d Volume" value={formatCurrency(market.volume1wk)} />
        <Stat label="Liquidity" value={formatCurrency(market.liquidity)} />
        <Stat label="End Date" value={market.endDate ? formatDate(market.endDate) : '-'} />
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
              <span className="text-sm font-medium w-24 shrink-0">{outcome.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${outcome.price * 100}%` }} />
              </div>
              <div className="flex items-center gap-1.5 w-28 justify-end">
                <span className="font-mono font-bold text-sm">{formatPrice(outcome.price)}</span>
                {isBinary && i === 0 && market.oneDayPriceChange !== 0 && (
                  <span
                    className={cn(
                      'flex items-center text-xs font-mono',
                      market.oneDayPriceChange > 0 ? 'text-emerald-600' : 'text-red-600',
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
            <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(market.bestBid)}</p>
          </div>
          <div className="bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Spread</p>
            <p className="font-mono font-bold">{formatPrice(market.spread)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 px-4 py-3 text-right">
            <p className="text-xs text-muted-foreground mb-1">Best Ask</p>
            <p className="font-mono font-bold text-red-700 dark:text-red-400">{formatPrice(market.bestAsk)}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last trade: <span className="font-mono">{formatPrice(market.lastTradePrice)}</span>
        </p>
      </section>

      <section className="border-t pt-6">
        <SectionHeading>Price Movement</SectionHeading>
        <div className="flex gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">24h change</span>
            <span
              className={cn(
                'font-mono font-semibold text-sm',
                market.oneDayPriceChange > 0
                  ? 'text-emerald-600'
                  : market.oneDayPriceChange < 0
                    ? 'text-red-600'
                    : 'text-muted-foreground',
              )}
            >
              {formatSigned(market.oneDayPriceChange)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">7d change</span>
            <span
              className={cn(
                'font-mono font-semibold text-sm',
                market.oneWeekPriceChange > 0
                  ? 'text-emerald-600'
                  : market.oneWeekPriceChange < 0
                    ? 'text-red-600'
                    : 'text-muted-foreground',
              )}
            >
              {formatSigned(market.oneWeekPriceChange)}
            </span>
          </div>
        </div>
      </section>

      {(isLoadingDisputes || disputes) && (
        <section className="border-t pt-6">
          <SectionHeading>Resolution Disputes</SectionHeading>
          {isLoadingDisputes ? <DisputeTimelineSkeleton /> : <DisputeTimeline disputes={disputes!} />}
        </section>
      )}

      {market.signals.length > 0 && (
        <div className="border-t pt-6">
          <SectionHeading>Signals</SectionHeading>
          <SignalBadges signals={market.signals} />
        </div>
      )}

      <ClientOnly>
        <AlertRuleListSection market={market} />
      </ClientOnly>
    </div>
  )
}

export function MarketDetails({ slug }: { slug: string }) {
  const { data: market } = useSuspenseQuery({
    queryKey: ['market', slug],
    queryFn: () => fetchMarket(slug),
  })

  return <MarketDetailsView market={market} />
}
