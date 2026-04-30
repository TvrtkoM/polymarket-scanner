import "server-only";
import { ApiError } from "../errors";
import { normaliseMarket } from "./normalise";
import { runRules } from "./rules";
import { GAMMA_URL, marketsPageCount } from "./constants";
import { parseWeiPrice, toStringRecord } from "../utils";
import type { MarketDisputes, MarketWithSignals } from "./types";
import type { MarketsParams } from "./search-params";

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
export async function getMarkets(
  cursor?: string,
  options: MarketsParams = { order: 'volume24hrClob', liquidity_num_min: 1000, tag_match: '' }
): Promise<{ markets: MarketWithSignals[]; nextCursor: string }> {
  let params: Record<string, string> = {
    active: 'true',
    closed: 'false',
    archived: 'false',
    accepting_orders: 'true',
    limit: marketsPageCount.toString(),
    ...toStringRecord(options),
    ascending: options.order === 'endDate' ? 'true' : 'false',
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
 * @returns normalised {@link MarketWithSignals}
 * @throws `Error` When the Polymarket API responds with a non-2xx status.
 */
export async function getMarket(slug: string): Promise<MarketWithSignals> {
  const res = await fetch(`${GAMMA_URL}/markets/slug/${slug}`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new ApiError(`Polymarket API error`, res.status)
  }

  const raw: Record<string, unknown> = await res.json();

  const market = normaliseMarket(raw);

  if (!market) {
    throw new ApiError(`Market not found`, 404)
  }

  return { ...market, signals: runRules(market) };
}

/**
 * Fetches UMA dispute resolution data for a single market by its question ID.
 *
 * @param questionId - The UMA question ID for the market.
 * @returns The {@link MarketDisputes} data for the market.
 * @throws {@link ApiError} When the data API responds with a non-2xx status.
 */
export async function getMarketDisputes(questionId: string): Promise<MarketDisputes> {
  const res = await fetch(`${DATA_API_URL}/subgraph/resolution/${questionId}`)
  if (!res.ok) throw new ApiError(`Dispute resolution API error`, res.status)
  const raw = await res.json()
  const data = raw.data as Record<string, unknown>
  const proposedPrice = data.proposedPrice as string
  const reproposedPrice = data.reproposedPrice as string
  return {
    proposedPrice: parseWeiPrice(proposedPrice),
    reproposedPrice: reproposedPrice === '69' ? null : parseWeiPrice(reproposedPrice),
  }
}