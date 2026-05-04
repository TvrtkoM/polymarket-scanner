/** Status codes of erroneous api calls that should be retried */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

/** Marks an error as eligible for automatic retry logic. */
export interface RetryableError {
  /** Whether this error should trigger a retry attempt. */
  readonly isRetryable: boolean
}

/**
 * Type guard that checks whether an unknown value is a {@link RetryableError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` has an `isRetryable` property, narrowing its type to {@link RetryableError}.
 */
export function isRetryable(err: unknown): err is RetryableError {
  return (err as RetryableError).isRetryable
}

/** Error thrown when an HTTP response has a non-2xx status code. */
export class ApiError extends Error implements RetryableError {
  get isRetryable() {
    return RETRYABLE_STATUS_CODES.has(this.statusCode)
  }

  constructor(
    message: string,
    /** The HTTP status code returned by the server. */
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
