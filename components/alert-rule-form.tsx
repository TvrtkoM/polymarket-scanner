'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Market } from '@/lib/markets/types'
import { useAlertRules } from '@/lib/watchlist/hooks'
import type { AlertRule, AlertRuleKind } from '@/lib/watchlist/types'
import { BellPlus } from 'lucide-react'
import { useCallback, useState } from 'react'

const KIND_LABELS: Record<AlertRuleKind, string> = {
  price_cross: 'Price crosses threshold',
  price_move_24h: 'Price move in 24h',
  volume_24h: 'Volume in 24h',
  near_resolution: 'Near resolution',
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

type FormState =
  | { kind: 'price_cross'; outcomeLabel: string; direction: 'above' | 'below'; threshold: string }
  | { kind: 'price_move_24h'; absChange: string }
  | { kind: 'volume_24h'; threshold: string }
  | { kind: 'near_resolution'; daysLeft: string }

function defaultForm(kind: AlertRuleKind, outcomes: Market['outcomes']): FormState {
  switch (kind) {
    case 'price_cross':
      return { kind, outcomeLabel: outcomes[0]?.label ?? 'Yes', direction: 'above', threshold: '0.6' }
    case 'price_move_24h':
      return { kind, absChange: '0.05' }
    case 'volume_24h':
      return { kind, threshold: '500000' }
    case 'near_resolution':
      return { kind, daysLeft: '3' }
  }
}

function parseForm(form: FormState): AlertRule | null {
  const id = randomId()
  switch (form.kind) {
    case 'price_cross': {
      const t = parseFloat(form.threshold)
      if (isNaN(t) || t < 0 || t > 1) return null
      return { id, kind: 'price_cross', outcomeLabel: form.outcomeLabel, direction: form.direction, threshold: t }
    }
    case 'price_move_24h': {
      const v = parseFloat(form.absChange)
      if (isNaN(v) || v <= 0 || v > 1) return null
      return { id, kind: 'price_move_24h', absChange: v }
    }
    case 'volume_24h': {
      const v = parseFloat(form.threshold)
      if (isNaN(v) || v < 0) return null
      return { id, kind: 'volume_24h', threshold: v }
    }
    case 'near_resolution': {
      const v = parseInt(form.daysLeft, 10)
      if (isNaN(v) || v < 1) return null
      return { id, kind: 'near_resolution', daysLeft: v }
    }
  }
}

type AlertRuleFormProps = {
  market: Pick<Market, 'id' | 'outcomes'>
}

export function AlertRuleForm({ market }: AlertRuleFormProps) {
  const { addRule } = useAlertRules(market.id)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(() => defaultForm('price_cross', market.outcomes))

  const setKind = useCallback(
    (kind: AlertRuleKind) => setForm(defaultForm(kind, market.outcomes)),
    [market.outcomes],
  )

  const handleSubmit = useCallback(() => {
    const parsed = parseForm(form)
    if (!parsed) return
    addRule(parsed)
    setOpen(false)
    setForm(defaultForm('price_cross', market.outcomes))
  }, [form, addRule, market.outcomes])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BellPlus className="size-3.5" />
          Add alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add alert rule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Alert type</Label>
            <Select value={form.kind} onValueChange={(v) => setKind(v as AlertRuleKind)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_LABELS) as AlertRuleKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{KIND_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.kind === 'price_cross' && (
            <>
              <div className="space-y-1.5">
                <Label>Outcome</Label>
                <Select
                  value={form.outcomeLabel}
                  onValueChange={(v) => setForm({ ...form, outcomeLabel: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {market.outcomes.map((o) => (
                      <SelectItem key={o.label} value={o.label}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select
                  value={form.direction}
                  onValueChange={(v) => setForm({ ...form, direction: v as 'above' | 'below' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Goes above</SelectItem>
                    <SelectItem value="below">Goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price threshold (0–1)</Label>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                />
              </div>
            </>
          )}

          {form.kind === 'price_move_24h' && (
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

          {form.kind === 'volume_24h' && (
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

          {form.kind === 'near_resolution' && (
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={parseForm(form) === null}>Add rule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
