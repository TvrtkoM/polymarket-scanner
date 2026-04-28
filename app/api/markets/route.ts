import { ApiError } from '@/lib/errors'
import { getMarkets } from '@/lib/markets/get-markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get('cursor') || undefined;

  try {
    const data = await getMarkets(cursor)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch from Polymarket'
    const statusCode = e instanceof ApiError ? e.statusCode : 502;
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
