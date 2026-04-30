import { ApiError } from '@/lib/errors'
import { getMarketDisputes } from '@/lib/markets/get-markets'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const questionId = request.nextUrl.searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: 'questionId is required' }, { status: 400 })
  }

  try {
    const disputes = await getMarketDisputes(questionId)
    return NextResponse.json({ disputes })
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Failed to fetch dispute resolution data'
    const statusCode = e instanceof ApiError ? e.statusCode : 502
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
