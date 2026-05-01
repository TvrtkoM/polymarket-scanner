import { ReactNode } from 'react'

export const metadata = { title: 'Watchlist' }

export default function WatchlistLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {children}
    </main>
  )
}
