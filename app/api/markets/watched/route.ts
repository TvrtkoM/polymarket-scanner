import { ApiError } from '@/lib/errors'
import { getWatchedMarkets } from '@/lib/markets/get-markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.getAll('id')

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  try {
    const data = await getWatchedMarkets(ids)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Failed to fetch from Polymarket'
    const statusCode = e instanceof ApiError ? e.statusCode : 502
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
