import { defaultShouldDehydrateQuery, environmentManager, QueryClient } from '@tanstack/react-query'
import { isRetryable } from './errors'

let browserQueryClient: QueryClient | null = null

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      queries: {
        staleTime: 60_000,
        retryDelay: 3000,
        retry: (failureCount, error) => {
          return isRetryable(error) && failureCount <= 2
        },
      },
    },
  })
}

/**
 * Returns the singleton {@link QueryClient} for the current environment.
 * On the server a fresh instance is created per request; on the browser the
 * same instance is reused across renders.
 */
export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
