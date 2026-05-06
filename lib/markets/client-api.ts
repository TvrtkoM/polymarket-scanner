import { ApiError } from '../errors'
import type { MarketDisputes, MarketWithSignals } from './types'
import type { MarketsParams } from './search-params'
import { toStringRecord } from '../utils'

/**
 * Fetches a JSON resource and returns it typed as `T`.
 * Wraps the native `fetch` API with automatic error handling for non-2xx responses.
 *
 * @param input - The URL or `RequestInfo` to fetch.
 * @param init - Optional request options passed directly to `fetch`.
 * @returns The parsed JSON response body cast to `T`.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)

  if (!res.ok) {
    throw new ApiError(`${(await res.json()).error} - ${res.statusText}`, res.status)
  }

  return res.json() as Promise<T>
}

/**
 * Fetches a paginated list of markets with their associated signals.
 *
 * @param cursor - Opaque cursor string identifying the next page. Omit or pass `undefined` to fetch the first page.
 * @param options - Optional filter and sort parameters forwarded to the Polymarket API.
 *   Keys match Polymarket's API parameter names exactly (`order`, `liquidity_num_min`).
 * @returns An object with `markets` (the current page of {@link MarketWithSignals}) and
 *   `nextCursor` (pass to the next call to advance the page).
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarkets(cursor?: string, options?: MarketsParams) {
  const params = new URLSearchParams({
    cursor: cursor ?? '',
    ...toStringRecord(options ?? {}),
  })
  return apiFetch<{ markets: MarketWithSignals[]; nextCursor: string }>(`/api/markets?${params}`)
}

/**
 * Fetches a single market by its slug from the internal API route.
 *
 * @param slug - The URL slug that uniquely identifies the market.
 * @returns {@link MarketWithSignals} for the requested slug.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarket(slug: string) {
  return apiFetch<MarketWithSignals>(`/api/market/${slug}`)
}

/**
 * Fetches UMA dispute resolution data for a market by its question ID.
 *
 * @param questionId - The UMA question ID for the market.
 * @returns {@link MarketDisputes} for the market.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarketDisputes(questionId: string) {
  return apiFetch<MarketDisputes>(`/api/market/disputes/${questionId}`)
}

/**
 * Fetches a batch of markets by their Polymarket ids from the internal API route.
 * Returns only the markets that were found; unknown ids are silently omitted.
 *
 * @param ids - Array of Polymarket market ids to fetch.
 * @returns Array of {@link MarketWithSignals} for found ids.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchWatchedMarkets(ids: string[]) {
  if (ids.length === 0) return []
  const params = new URLSearchParams()
  ids.forEach((id) => params.append('id', id))
  return apiFetch<MarketWithSignals[]>(`/api/markets/watched?${params}`)
}
