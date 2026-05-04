import { ApiError } from '@/lib/errors'
import { getMarket } from '@/lib/markets/get-markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const data = await getMarket(slug)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Failed to fetch from Polymarket'
    const statusCode = e instanceof ApiError ? e.statusCode : 502
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
