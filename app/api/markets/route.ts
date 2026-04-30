import { ApiError } from '@/lib/errors'
import { getMarkets } from '@/lib/markets/get-markets'
import { loadMarketsSearchParams } from '@/lib/markets/search-params'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get('cursor') || undefined;
  const options = await loadMarketsSearchParams(request);

  try {
    const data = await getMarkets(cursor, options)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch from Polymarket'
    const statusCode = e instanceof ApiError ? e.statusCode : 502;
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
