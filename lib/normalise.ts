
export type Outcome = {
  label: string
  price: number
}

export type Market = {
  id: string
  question: string
  slug: string
  outcomes: Outcome[]
  volume24h: number
  volume1wk: number
  liquidity: number
  endDate: Date | null
  active: boolean
  acceptingOrders: boolean
  lastTradePrice: number
  bestBid: number
  bestAsk: number
  spread: number
  oneDayPriceChange: number
  oneWeekPriceChange: number
  eventTitle: string | null
  eventId: string | null
  image: string | null
}

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
    outcomes,
    volume24h: (raw.volume24hrClob as number) ?? 0,
    volume1wk: (raw.volume1wkClob as number) ?? 0,
    liquidity: (raw.liquidityNum as number) ?? 0,
    endDate: raw.endDate ? new Date(raw.endDate as string) : null,
    active: raw.active as boolean,
    acceptingOrders: raw.acceptingOrders as boolean,
    lastTradePrice: (raw.lastTradePrice as number) ?? 0,
    bestBid: (raw.bestBid as number) ?? 0,
    bestAsk: (raw.bestAsk as number) ?? 0,
    spread: (raw.spread as number) ?? 0,
    oneDayPriceChange: (raw.oneDayPriceChange as number) ?? 0,
    oneWeekPriceChange: (raw.oneWeekPriceChange as number) ?? 0,
    eventTitle: events?.[0]?.title as string ?? null,
    eventId: events?.[0]?.id as string ?? null,
    image: (raw.image as string) ?? null,
  }
}