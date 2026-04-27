import { getMarket } from '@/lib/markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    const data = await getMarket(slug)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch from Polymarket'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
