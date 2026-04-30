import { ApiError } from "./errors";
import type { MarketDisputes, MarketWithSignals } from "./markets/types";

/**
 * Fetches a JSON resource and returns it typed as `T`.
 * Wraps the native `fetch` API with automatic error handling for non-2xx responses.
 *
 * @param input - The URL or `RequestInfo` to fetch.
 * @param init - Optional request options passed directly to `fetch`.
 * @returns The parsed JSON response body cast to `T`.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
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
 * @returns An object containing the markets for the requested page and the cursor for the next page.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarkets(cursor?: string) {
  return apiFetch<{ markets: MarketWithSignals[]; nextCursor: string }>(`/api/markets?cursor=${cursor ?? ""}`);
}

/**
 * Fetches a single market by its slug from the internal API route.
 *
 * @param slug - The URL slug that uniquely identifies the market.
 * @returns An object containing the {@link MarketWithSignals} for the requested slug.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarket(slug: string) {
  return apiFetch<{ market: MarketWithSignals }>(`/api/market?slug=${slug}`)
}

/**
 * Fetches UMA dispute resolution data for a market by its question ID.
 *
 * @param questionId - The UMA question ID for the market.
 * @returns An object containing the {@link MarketDisputes} for the market.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarketDisputes(questionId: string) {
  return apiFetch<{ disputes: MarketDisputes }>(`/api/market/disputes?questionId=${questionId}`)
}