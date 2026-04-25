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
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(text || res.statusText, res.status)
  }

  return res.json() as Promise<T>
}

export async function fetchMarkets() {
  return apiFetch<{ markets: MarketWithSignals[] }>('/api/markets');
}