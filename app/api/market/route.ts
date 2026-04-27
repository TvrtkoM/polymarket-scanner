import { ApiError } from '@/lib/errors'
import { getMarket } from '@/lib/markets/get-markets'
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
    const message = e instanceof ApiError ? e.message : 'Failed to fetch from Polymarket'
    const statusCode = e instanceof ApiError ? e.statusCode : 502;
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
