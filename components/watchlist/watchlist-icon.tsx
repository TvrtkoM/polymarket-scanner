'use client'

import { useIsHydrated } from '@/lib/hooks'
import type { Market } from '@/lib/markets/types'
import { cn } from '@/lib/utils'
import { useWatchlist } from '@/lib/watchlist/hooks'
import { BellPlus } from 'lucide-react'
import { useState } from 'react'
import { AlertRuleDialog } from '../alerts/alert-rule-form'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { sectionHeadingClassName } from '../ui/section-heading'

function ConfirmAlertRemovalDialog({
  open,
  onConfirm,
  onCancel,
  numAlerts,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  numAlerts: number
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onCancel()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={sectionHeadingClassName}>Confirm removing market from watchlist?</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          {numAlerts} alerts are active ont this market. Are you sure you want to remove them?
        </DialogDescription>
        <div className="flex gap-3 justify-end">
          <Button variant={'outline'} onClick={() => onCancel()}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm()}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type WatchlistIconProps = {
  market: Market
  className?: string
}

export function WatchlistIcon({ market, className }: WatchlistIconProps) {
  const { isWatched, remove, entries } = useWatchlist()
  const watched = isWatched(market.id)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const watchlistEntry = entries.find((e) => e.marketId === market.id)
  const alerts = watchlistEntry?.alertRules ?? []
  const numAlerts = alerts.length

  const toggle = () => {
    if (watched) {
      setConfirmDialogOpen(true)
    } else {
      setRuleDialogOpen(true)
    }
  }

  const hydrated = useIsHydrated()

  if (!hydrated) {
    return <Skeleton className="h-8 w-8" />
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
        aria-pressed={watched}
        className={cn('relative cursor-pointer', watched && 'text-red-700 hover:text-amber-600', className)}
      >
        <BellPlus className="size-4" />
        {numAlerts > 0 && (
          <span className="absolute -top-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white leading-none">
            {numAlerts > 9 ? '9+' : numAlerts}
          </span>
        )}
      </Button>
      <AlertRuleDialog market={market} open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} />
      <ConfirmAlertRemovalDialog
        numAlerts={numAlerts}
        onConfirm={() => {
          remove(market.id)
          setConfirmDialogOpen(false)
        }}
        onCancel={() => setConfirmDialogOpen(false)}
        open={confirmDialogOpen}
      />
    </>
  )
}
