'use client'

import { Button } from '@/components/ui/button'
import type { Market } from '@/lib/markets/types'
import { formatCurrency, formatSignedPercent } from '@/lib/utils'
import { alertStateAtom } from '@/lib/watchlist/atoms'
import { useAlertRules, useWatchlist } from '@/lib/watchlist/hooks'
import type { AlertRule, AlertRuleState } from '@/lib/watchlist/types'
import { useAtomValue } from 'jotai'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { SectionHeading } from '../ui/section-heading'
import { AddAlertButton, AlertRuleDialog } from './alert-rule-form'

function ruleDescription(rule: AlertRule): string {
  switch (rule.ruleSlug) {
    case 'price_cross':
      return `${rule.outcomeLabel} price ${rule.direction} ${(rule.threshold * 100).toFixed(0)}%`
    case 'price_move_24h':
      return `24h move ≥ ${formatSignedPercent(rule.absChange)}`
    case 'volume_24h':
      return `24h volume > ${formatCurrency(rule.threshold)}`
    case 'near_resolution':
      return `Resolves within ${rule.daysLeft} day(s)`
  }
}

function RuleStatusBadge({ state }: { state: AlertRuleState | undefined }) {
  const fired = state?.status === 'fired'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        fired ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {fired ? 'fired' : 'armed'}
    </span>
  )
}

type AlertRuleRowProps = {
  rule: AlertRule
  state: AlertRuleState | undefined
  onRemove: (id: string) => void
  onReset: (id: string) => void
}

function AlertRuleRow({ rule, state, onRemove, onReset }: AlertRuleRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="flex-1 truncate text-muted-foreground">{ruleDescription(rule)}</span>
      <RuleStatusBadge state={state} />
      {state?.status === 'fired' && (
        <Button variant="ghost" size="icon-xs" onClick={() => onReset(rule.id)} aria-label="Re-arm rule" title="Re-arm">
          <RefreshCw className="size-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(rule.id)}
        aria-label="Remove rule"
        title="Remove"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  )
}

export function AlertRuleList({ market }: { market: Market }) {
  const { rules, removeRule, resetRule } = useAlertRules(market.id)
  const { remove: removeWathlistItem } = useWatchlist()

  const alertState = useAtomValue(alertStateAtom)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-1.5 px-1">
      {rules.map((rule) => (
        <AlertRuleRow
          key={rule.id}
          rule={rule}
          state={alertState[rule.id]}
          onRemove={(id) => {
            const isLast = rules.length === 1
            removeRule(id)
            if (isLast) {
              removeWathlistItem(market.id)
            }
          }}
          onReset={resetRule}
        />
      ))}
      <AddAlertButton onClick={() => setDialogOpen(true)} />
      <AlertRuleDialog market={market} onOpenChange={setDialogOpen} open={dialogOpen} />
    </div>
  )
}

export function AlertRuleListSection({ market }: { market: Market }) {
  const { isWatched } = useWatchlist()

  if (!isWatched(market.id)) {
    return null
  }

  return (
    <section className="border-t pt-6">
      <SectionHeading>Alert rules</SectionHeading>
      <AlertRuleList market={market} />
    </section>
  )
}
