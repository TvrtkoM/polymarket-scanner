import { normaliseMarket } from '@/lib/normalise'
import { runRules } from '@/lib/rules'
import { NextResponse } from 'next/server'

const GAMMA_URL = 'https://gamma-api.polymarket.com'

const params = new URLSearchParams({
  active: 'true',
  closed: 'false',
  archived: 'false',
  accepting_orders: 'true',
  liquidity_num_min: '1000',
  order: 'volume24hrClob',
  ascending: 'false',
  limit: '20',
})

export async function GET() {
  const res = await fetch(
    `${GAMMA_URL}/markets?${params}`,
    { next: { revalidate: 60 } }
  )

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch from Polymarket' },
      { status: res.status }
    )
  }

  const raw: Record<string, unknown>[] = await res.json()

  const markets = raw.map(normaliseMarket).filter((m) => m != null);

  const signals = runRules(markets)

  return NextResponse.json({ markets, signals })
}