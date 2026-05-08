import { ApiError } from '@/lib/errors'
import { getMarketHolders } from '@/lib/markets/get-markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ conditionId: string }> }) {
  const { conditionId } = await params
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 20)
  const offset = Number(request.nextUrl.searchParams.get('offset') ?? 0)

  try {
    const holders = await getMarketHolders(conditionId, limit, offset)
    return NextResponse.json(holders)
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Failed to fetch holders'
    const statusCode = e instanceof ApiError ? e.statusCode : 502
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
