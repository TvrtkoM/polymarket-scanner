import "server-only";
import { ApiError } from "../errors";
import { normaliseMarket } from "./normalise";
import { runRules } from "./rules";
import { GAMMA_URL, marketsPageCount } from "./constants";
import type { MarketWithSignals } from "./types";

/**
 * Fetches a paginated list of active, tradeable markets from the Polymarket API,
 * normalises each entry, and attaches computed trading signals.
 *
 * Results are cached by Next.js and revalidated every 60 seconds.
 *
 * @param page - Zero-based page index to retrieve.
 * @defaultValue page `0`
 * @returns An object containing the normalised {@link MarketWithSignals} array for the requested page and whether more pages exist.
 * @throws `Error` When the Polymarket API responds with a non-2xx status.
 */
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
    throw new ApiError(`Polymarket API error`, res.status)
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


/**
 * Fetches a single market by its slug from the Polymarket API,
 * normalises it, and attaches computed trading signals.
 *
 * Results are cached by Next.js and revalidated every 60 seconds.
 *
 * @param slug - The URL slug that uniquely identifies the market.
 * @returns An object containing the normalised {@link MarketWithSignals}, or `null` if the slug does not match a valid market.
 * @throws `Error` When the Polymarket API responds with a non-2xx status.
 */
export async function getMarket(slug: string): Promise<{ market: MarketWithSignals } | null> {
  const res = await fetch(`${GAMMA_URL}/markets/slug/${slug}`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new ApiError(`Polymarket API error`, res.status)
  }

  const raw: Record<string, unknown> = await res.json();

  console.log(raw)

  const market = normaliseMarket(raw);

  if (!market) {
    throw new ApiError(`Market not found`, 404)
  }

  return { market: { ...market, signals: runRules(market) } };
}