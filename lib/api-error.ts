
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
