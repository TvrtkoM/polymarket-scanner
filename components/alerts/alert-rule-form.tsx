'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RULES_LABELS } from '@/lib/markets/constants'
import type { Market } from '@/lib/markets/types'
import { useAlertRules, useWatchlist } from '@/lib/watchlist/hooks'
import type { AlertRule, AlertRuleSlug } from '@/lib/watchlist/types'
import { BellPlus } from 'lucide-react'
import { useState } from 'react'
import { sectionHeadingClassName } from '../ui/section-heading'

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

type FormState =
  | {
      ruleSlug: 'price_cross'
      outcomeLabel: string
      direction: 'above' | 'below'
      threshold: string
    }
  | { ruleSlug: 'price_move_24h'; absChange: string }
  | { ruleSlug: 'volume_24h'; threshold: string }
  | { ruleSlug: 'near_resolution'; daysLeft: string }

function defaultForm(ruleSlug: AlertRuleSlug, outcomes: Market['outcomes']): FormState {
  switch (ruleSlug) {
    case 'price_cross':
      return {
        ruleSlug,
        outcomeLabel: outcomes[0]?.label ?? 'Yes',
        direction: 'above',
        threshold: '0.6',
      }
    case 'price_move_24h':
      return { ruleSlug, absChange: '0.05' }
    case 'volume_24h':
      return { ruleSlug, threshold: '500000' }
    case 'near_resolution':
      return { ruleSlug, daysLeft: '3' }
  }
}

const { tossup: _, ...ALERT_RULES_LABELS } = RULES_LABELS

function parseForm(form: FormState): AlertRule | null {
  const id = randomId()
  switch (form.ruleSlug) {
    case 'price_cross': {
      const t = parseFloat(form.threshold)
      if (isNaN(t) || t < 0 || t > 1) return null
      return {
        id,
        ruleSlug: 'price_cross',
        outcomeLabel: form.outcomeLabel,
        direction: form.direction,
        threshold: t,
      }
    }
    case 'price_move_24h': {
      const v = parseFloat(form.absChange)
      if (isNaN(v) || v <= 0 || v > 1) return null
      return { id, ruleSlug: 'price_move_24h', absChange: v }
    }
    case 'volume_24h': {
      const v = parseFloat(form.threshold)
      if (isNaN(v) || v < 0) return null
      return { id, ruleSlug: 'volume_24h', threshold: v }
    }
    case 'near_resolution': {
      const v = parseInt(form.daysLeft, 10)
      if (isNaN(v) || v < 1) return null
      return { id, ruleSlug: 'near_resolution', daysLeft: v }
    }
  }
}

export function AlertRuleForm({
  market,
  onSubmit,
  onCancel,
}: {
  market: Market
  onSubmit?: () => void
  onCancel?: () => void
}) {
  const { addRule } = useAlertRules(market.id)
  const { isWatched, add } = useWatchlist()

  const [form, setForm] = useState<FormState>(() => defaultForm('price_cross', market.outcomes))

  const setRuleId = (ruleId: AlertRuleSlug) => setForm(defaultForm(ruleId, market.outcomes))

  const handleSubmit = () => {
    const parsed = parseForm(form)

    if (!parsed) return
    if (!isWatched(market.id)) {
      add({
        marketId: market.id,
        slug: market.slug,
        question: market.question,
      })
    }
    addRule(parsed)
    setForm(defaultForm('price_cross', market.outcomes))
    onSubmit?.()
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="type">Alert type</Label>
        <Select value={form.ruleSlug} onValueChange={(v) => setRuleId(v as AlertRuleSlug)}>
          <SelectTrigger className="w-full" id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ALERT_RULES_LABELS) as AlertRuleSlug[]).map((k) => (
              <SelectItem key={k} value={k}>
                {ALERT_RULES_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {form.ruleSlug === 'price_cross' && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="outcome">Outcome</Label>
            <Select value={form.outcomeLabel} onValueChange={(v) => setForm({ ...form, outcomeLabel: v })}>
              <SelectTrigger className="w-full" id="outcome">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {market.outcomes.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="direction">Direction</Label>
            <Select
              value={form.direction}
              onValueChange={(v) => setForm({ ...form, direction: v as 'above' | 'below' })}
            >
              <SelectTrigger className="w-full" id="direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Goes above</SelectItem>
                <SelectItem value="below">Goes below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="threshold">Price threshold (0–1)</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              id="threshhold"
            />
          </div>
        </>
      )}

      {form.ruleSlug === 'price_move_24h' && (
        <div className="space-y-1.5">
          <Label>Minimum absolute change (0–1, e.g. 0.05 = 5%)</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={form.absChange}
            onChange={(e) => setForm({ ...form, absChange: e.target.value })}
          />
        </div>
      )}

      {form.ruleSlug === 'volume_24h' && (
        <div className="space-y-1.5">
          <Label>Volume threshold (USD)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })}
          />
        </div>
      )}

      {form.ruleSlug === 'near_resolution' && (
        <div className="space-y-1.5">
          <Label>Days until resolution</Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={form.daysLeft}
            onChange={(e) => setForm({ ...form, daysLeft: e.target.value })}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={parseForm(form) === null}>
          Add rule
        </Button>
      </div>
    </div>
  )
}

export function AlertRuleDialog({
  market,
  open,
  onOpenChange,
}: {
  market: Market
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={sectionHeadingClassName}>Add alert rule</DialogTitle>
        </DialogHeader>

        <AlertRuleForm market={market} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function AddAlertButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <BellPlus className="size-3.5" />
      Add alert
    </Button>
  )
}
