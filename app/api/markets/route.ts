import { getMarkets } from '@/lib/markets'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await getMarkets()
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch from Polymarket'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}