import "server-only";
import { ApiError } from "../errors";
import { normaliseMarket } from "./normalise";
import { runRules } from "./rules";
import { GAMMA_URL, marketsPageCount } from "./constants";
import type { MarketWithSignals } from "./types";

const DATA_API_URL = 'https://data-api.polymarket.com'

/**
 * Fetches a paginated list of active, tradeable markets from the Polymarket API,
 * normalises each entry, and attaches computed trading signals.
 *
 * Results are cached by Next.js and revalidated every 60 seconds.
 *
 * @param cursor - Opaque keyset cursor returned by a previous call; omit to fetch the first page.
 * @returns An object containing the normalised {@link MarketWithSignals} array and an opaque `nextCursor` to pass on the next call.
 * @throws `Error` When the Polymarket API responds with a non-2xx status.
 */
export async function getMarkets(cursor?: string): Promise<{ markets: MarketWithSignals[]; nextCursor: string }> {
  let params: Record<string, string> = {
    active: 'true',
    closed: 'false',
    archived: 'false',
    accepting_orders: 'true',
    liquidity_num_min: '1000',
    order: 'volume24hrClob',
    ascending: 'false',
    limit: marketsPageCount.toString(),
  };

  if (cursor) {
    params = { ...params, after_cursor: cursor };
  }

  const res = await fetch(
    `${GAMMA_URL}/markets/keyset?${new URLSearchParams(params)}`,
    {
      next: { revalidate: 60 }
    }
  )

  if (!res.ok) {
    throw new ApiError(`Polymarket API error`, res.status)
  }

  const raw: { markets: Record<string, unknown>[], next_cursor: string } = await res.json()

  const nextCursor = raw.next_cursor;
  const marketsRaw = raw.markets;

  const markets = marketsRaw
    .slice(0, marketsPageCount)
    .map((rawMarket) => normaliseMarket(rawMarket))
    .filter((m) => m != null)
    .map((market) => ({ ...market, signals: runRules(market) }))

  return { markets, nextCursor }
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

  const statuses = raw.umaResolutionStatuses as string[] | undefined
  const hasDispute = statuses?.includes('disputed') ?? false

  let resolution: Record<string, unknown> | undefined
  if (hasDispute && raw.questionID) {
    const dRes = await fetch(`${DATA_API_URL}/subgraph/resolution/${raw.questionID}`)
    if (!dRes.ok) throw new ApiError(`Dispute resolution API error`, dRes.status)
    const dRaw = await dRes.json()
    resolution = dRaw.data as Record<string, unknown>
  }

  const market = normaliseMarket(raw, resolution);

  if (!market) {
    throw new ApiError(`Market not found`, 404)
  }

  return { market: { ...market, signals: runRules(market) } };
}