import { MarketWithSignals } from "./types"

/** Error thrown when an HTTP response has a non-2xx status code. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** The HTTP status code returned by the server. */
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

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
    throw new ApiError(`Fetch error - ${res.statusText}`, res.status)
  }

  return res.json() as Promise<T>
}

/**
 * Fetches a paginated list of markets with their associated signals.
 *
 * @param page - Zero-based page index to retrieve.
 * @defaultValue page `0`
 * @returns An object containing the markets for the requested page and whether more pages exist.
 * @throws {@link ApiError} When the response status is not ok.
 */
export async function fetchMarkets(page = 0) {
  return apiFetch<{ markets: MarketWithSignals[]; hasNextPage: boolean }>(`/api/markets?page=${page}`);
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