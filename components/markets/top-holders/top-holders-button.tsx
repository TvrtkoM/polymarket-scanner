'use client'

import { Button } from '@/components/ui/button'
import { useIsHydrated } from '@/lib/hooks'
import type { MarketWithSignals } from '@/lib/markets/types'
import { useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { TopHoldersDialog } from './top-holders-dialog'

export function TopHoldersButton({ market }: { market: MarketWithSignals }) {
  const [open, setOpen] = useState(false)
  const hydrated = useIsHydrated()
  const queryClient = useQueryClient()
  const disabled = !hydrated || market.conditionId == null

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      queryClient.removeQueries({ queryKey: ['holders', market.conditionId], exact: true })
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)} className="cursor-pointer">
        <Users className="size-4" />
        Top Holders
      </Button>
      {open && <TopHoldersDialog market={market} open={open} onOpenChange={handleOpenChange} />}
    </>
  )
}
