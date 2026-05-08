'use client'

import { useIsHydrated } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertCenter } from './alerts/alert-center'
import { Skeleton } from './ui/skeleton'
import { useWatchlist } from '@/lib/watchlist/hooks'

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/watchlist', label: 'Watchlist' },
] as const

export function Header() {
  const pathname = usePathname()
  const { entries } = useWatchlist()

  const hydrated = useIsHydrated()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 py-3">
        <nav className="flex items-center gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1',
                pathname.startsWith(href)
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <div>{label}</div>
              {href === '/watchlist' && entries.length > 0 && (
                <div className="size-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  {entries.length}
                </div>
              )}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {hydrated ? <AlertCenter /> : <Skeleton className="h-8 w-8" />}
          <Link
            href="/settings"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  )
}
