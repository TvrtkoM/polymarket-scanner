import { getMarkets } from '@/lib/markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? '0')

  try {
    const data = await getMarkets(page)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch from Polymarket'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
