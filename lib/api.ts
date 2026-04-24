export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

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
