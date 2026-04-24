import { defaultShouldDehydrateQuery, environmentManager, QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

let browserQueryClient: QueryClient | null = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => {
          if (failureCount >= 3) return false
          if (error instanceof ApiError) {
            return RETRYABLE_STATUS_CODES.has(error.statusCode)
          }
          return false
        },
      },
    },
  })
}

export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}