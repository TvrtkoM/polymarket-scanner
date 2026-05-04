import type { Market, Outcome } from './types'

/**
 * Converts a raw Polymarket API market object into a typed {@link Market},
 * applying eligibility filters and parsing nested JSON fields.
 *
 * Returns `null` for markets that are inactive, closed, archived, not accepting
 * orders, have less than $1,000 liquidity, or contain malformed outcome data.
 *
 * @param raw - An untyped market object from the Polymarket REST API.
 * @returns A normalised {@link Market}, or `null` if the market should be skipped.
 */
export function normaliseMarket(raw: Record<string, unknown>): Market | null {
  // drop markets we don't care about
  if (!raw.active || raw.closed || raw.archived) return null
  if (!raw.acceptingOrders) return null
  if ((raw.liquidityNum as number) < 1000) return null

  let outcomes: Outcome[] = []

  try {
    const labels = JSON.parse(raw.outcomes as string) as string[]
    const prices = JSON.parse(raw.outcomePrices as string) as string[]
    outcomes = labels.map((label, i) => ({
      label,
      price: parseFloat(prices[i]),
    }))
  } catch {
    return null // malformed, skip
  }

  const events = raw.events as Array<Record<string, unknown>> | undefined

  return {
    id: raw.id as string,
    question: raw.question as string,
    slug: raw.slug as string,
    description: raw.description as string,
    outcomes,
    volume24h: (raw.volume24hrClob as number) ?? 0,
    volume1wk: (raw.volume1wkClob as number) ?? 0,
    liquidity: (raw.liquidityNum as number) ?? 0,
    endDate: (raw.endDate as string) ?? null,
    active: raw.active as boolean,
    acceptingOrders: raw.acceptingOrders as boolean,
    lastTradePrice: (raw.lastTradePrice as number) ?? 0,
    bestBid: (raw.bestBid as number) ?? 0,
    bestAsk: (raw.bestAsk as number) ?? 0,
    spread: (raw.spread as number) ?? 0,
    oneDayPriceChange: (raw.oneDayPriceChange as number) ?? 0,
    oneWeekPriceChange: (raw.oneWeekPriceChange as number) ?? 0,
    eventTitle: (events?.[0]?.title as string) ?? null,
    eventId: (events?.[0]?.id as string) ?? null,
    eventSlug: (events?.[0]?.slug as string) ?? null,
    image: (raw.image as string) ?? null,
    disputed: (raw.umaResolutionStatuses as string[] | undefined)?.includes('disputed') ?? false,
    questionId: (raw.questionID as string) ?? null,
  }
}
