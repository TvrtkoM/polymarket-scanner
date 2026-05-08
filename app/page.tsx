import { Activity, ArrowRight, Bell, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Activity,
    title: 'Trading signals',
    description: 'Rule-based signals surface price moves, volume surges, near-resolution markets, and tossups.',
  },
  {
    icon: Bookmark,
    title: 'Watchlist',
    description: 'Pin the markets you care about and keep them one click away across sessions.',
  },
  {
    icon: Bell,
    title: 'Alerts',
    description: 'Browser notifications fire when watched markets trip the rules you care about.',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-16 sm:py-24">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Polymarket Scanner</h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Active Polymarket prediction markets alongside computed trading signals to help inform trading decisions.
        </p>
        <Button asChild size="lg">
          <Link href="/markets">
            Browse markets
            <ArrowRight />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-2 rounded-lg border border-border p-5">
            <Icon className="size-5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
