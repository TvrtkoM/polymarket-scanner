
/** Status codes of erroneous api calls that should be retried */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

export interface RetryableError {
  readonly isRetryable: boolean;
}

export function isRetryable(err: unknown): err is RetryableError {
  return (err as RetryableError).isRetryable;
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
