'use client'

import { SORT_OPTIONS } from '@/lib/markets/constants'
import { marketsSearchParsers } from '@/lib/markets/search-params'
import { MarketSortKey } from '@/lib/markets/types'
import { X } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { useCallback, useOptimistic, useState, useTransition } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const DEFAULT_ORDER = marketsSearchParsers.order.defaultValue
const DEFAULT_LIQUIDITY = marketsSearchParsers.liquidity_num_min.defaultValue

export function MarketsFilters() {
  const [{ order, liquidity_num_min: liqNumMinQuery, closed }, setParams] = useQueryStates(marketsSearchParsers)

  const [optimisticClosed, setOptimisticClosed] = useOptimistic(closed)
  const [isPending, startTransition] = useTransition()

  const isDirty = order !== DEFAULT_ORDER || liqNumMinQuery !== DEFAULT_LIQUIDITY

  const [liqNumMin, setLiqNumMin] = useState(liqNumMinQuery)

  const setLiqNumMinQuery = useCallback(
    (liq: number) => {
      setParams({ liquidity_num_min: liq })
    },
    [setParams],
  )

  const debouncedSetMinLiquidityQuery = useDebounceCallback(setLiqNumMinQuery, 250)

  function reset() {
    setParams({
      order: DEFAULT_ORDER,
      liquidity_num_min: DEFAULT_LIQUIDITY,
    })
    setLiqNumMin(DEFAULT_LIQUIDITY)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="order">Order markets by:</Label>
        <Select value={order} onValueChange={(v) => setParams({ order: v as MarketSortKey })}>
          <SelectTrigger className="w-full" id="order">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="min-liquidity">Minimum liquidity:</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            value={liqNumMin}
            onChange={(e) => {
              setLiqNumMin(+e.target.value)
              debouncedSetMinLiquidityQuery(+e.target.value)
            }}
            id="min-liquidity"
            className="w-32 pl-5"
            aria-label="Minimum liquidity"
            placeholder="Min liquidity"
          />
        </div>
      </div>

      <div className="space-y-1 5">
        <Label htmlFor="closed">Only closed</Label>
        <div className="h-8 flex items-center">
          <Checkbox
            id="closed"
            checked={optimisticClosed}
            disabled={isPending}
            onCheckedChange={(checked) => {
              startTransition(async () => {
                setOptimisticClosed(checked === true)
                await setParams({ closed: checked === true })
              })
            }}
          />
        </div>
      </div>

      {isDirty && (
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1 self-end h-8 cursor-pointer">
          <X />
          Reset
        </Button>
      )}
    </div>
  )
}
