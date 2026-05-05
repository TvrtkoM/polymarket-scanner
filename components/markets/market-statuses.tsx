import { resolutionStatusVariants } from '@/lib/class-variants'
import { Market } from '@/lib/markets/types'
import { cn } from '@/lib/utils'
import capitalize from 'lodash/capitalize'

export function MarketStatuses({ market }: { market: Market }) {
  return (
    <div className="flex gap-2 text-xs">
      {market.resolutionStatus && (
        <div className={cn('px-3 py-1 rounded-sm', resolutionStatusVariants({ status: market.resolutionStatus }))}>
          {capitalize(market.resolutionStatus)}
        </div>
      )}
      {market.closed && <div className="px-3 py-1 rounded-sm bg-slate-100 text-slate-600">Closed</div>}
    </div>
  )
}
