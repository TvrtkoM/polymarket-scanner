'use client'

import { useAtom } from 'jotai'
import { alertStateAtom, appendFiredAlert, firedAlertsAtom, watchlistAtom } from './atoms'
import type { AlertRule, WatchlistEntry } from './types'

/**
 * Provides read and write access to the watchlist.
 *
 * @returns
 * - `entries` — all watched markets.
 * - `isWatched(marketId)` — whether a market is currently on the watchlist.
 * - `add(entry)` — adds a market; no-op if already present.
 * - `remove(marketId)` — removes a market and its alert rule state.
 */
export function useWatchlist() {
  const [entries, setEntries] = useAtom(watchlistAtom)
  const [, setAlertState] = useAtom(alertStateAtom)

  const isWatched = (marketId: string) => entries.some((e) => e.marketId === marketId)

  const add = (entry: Omit<WatchlistEntry, 'addedAt' | 'alertRules'>) => {
    setEntries((prev) => {
      if (prev.some((e) => e.marketId === entry.marketId)) return prev
      return [...prev, { ...entry, addedAt: new Date().toISOString(), alertRules: [] }]
    })
  }

  const remove = (marketId: string) => {
    const entry = entries.find(e => e.marketId === marketId);
    if (!entry) {
      return;
    }

    const alertsIds = entry.alertRules.map(ar => ar.id);

    setEntries(entries.filter(e => e.marketId !== marketId));

    setAlertState((s) => {
      const next = { ...s };
      alertsIds.forEach(id => delete next[id])
      return next
    })

  }

  return { entries, isWatched, add, remove }
}

/**
 * Provides read and write access to alert rules for a specific market.
 *
 * @param marketId - The market whose rules to manage.
 */
export function useAlertRules(marketId: string) {
  const [entries, setEntries] = useAtom(watchlistAtom)
  const [, setAlertState] = useAtom(alertStateAtom)

  const entry = entries.find((e) => e.marketId === marketId)
  const rules = entry?.alertRules ?? []

  const addRule = (rule: AlertRule) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.marketId === marketId ? { ...e, alertRules: [...e.alertRules, rule] } : e,
      ),
    )
  }

  const updateRule = (rule: AlertRule) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.marketId === marketId
          ? { ...e, alertRules: e.alertRules.map((r) => (r.id === rule.id ? rule : r)) }
          : e,
      ),
    )
  }

  const removeRule = (ruleId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.marketId === marketId
          ? { ...e, alertRules: e.alertRules.filter((r) => r.id !== ruleId) }
          : e,
      ),
    )
    setAlertState((s) => {
      const next = { ...s }
      delete next[ruleId]
      return next
    })
  }

  const resetRule = (ruleId: string) => {
    setAlertState((s) => ({
      ...s,
      [ruleId]: { ruleId, status: 'armed' },
    }))
  }

  return { rules, addRule, updateRule, removeRule, resetRule }
}

/**
 * Provides read access to the fired-alert history and actions to manage it.
 *
 * @returns
 * - `alerts` — all fired alerts, newest first.
 * - `unreadCount` — number of unread alerts.
 * - `markAllRead` — marks all alerts as read.
 * - `clear` — removes all fired alerts from history.
 * - `appendAlert` — internal use by the poller to record a new firing.
 */
export function useFiredAlerts() {
  const [alerts, setAlerts] = useAtom(firedAlertsAtom)

  const unreadCount = alerts.filter((a) => !a.read).length

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  const clear = () => {
    setAlerts([])
  }

  const appendAlert = (alert: Parameters<typeof appendFiredAlert>[1]) => {
    setAlerts((prev) => appendFiredAlert(prev, alert))
  }

  return { alerts, unreadCount, markAllRead, clear, appendAlert }
}
