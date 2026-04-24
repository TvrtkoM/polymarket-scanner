import { MarketsList } from '@/components/markets-list'

export const metadata = { title: 'Markets' }

export default function MarketsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Markets</h1>
      <MarketsList />
    </main>
  )
}
