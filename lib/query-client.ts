import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
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
