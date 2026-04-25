
import 'server-only'
import { marketsPageCount } from './constants'
import { normaliseMarket } from './normalise'
import { runRules } from './rules'
import type { MarketWithSignals } from './types'

const GAMMA_URL = 'https://gamma-api.polymarket.com'

export async function getMarkets(page = 0): Promise<{ markets: MarketWithSignals[]; hasNextPage: boolean }> {
  const params = new URLSearchParams({
    active: 'true',
    closed: 'false',
    archived: 'false',
    accepting_orders: 'true',
    liquidity_num_min: '1000',
    order: 'volume24hrClob',
    ascending: 'false',
    limit: (marketsPageCount + 1).toString(),
    offset: (page * marketsPageCount).toString(),
  })

  const res = await fetch(
    `${GAMMA_URL}/markets?${params}`,
    { next: { revalidate: 60 } }
  )

  if (!res.ok) {
    throw new Error(`Polymarket API error: ${res.status}`)
  }

  const raw: Record<string, unknown>[] = await res.json()
  const hasNextPage = raw.length > marketsPageCount

  const markets = raw
    .slice(0, marketsPageCount)
    .map(normaliseMarket)
    .filter((m) => m != null)
    .map((market) => ({ ...market, signals: runRules(market) }))

  return { markets, hasNextPage }
}
