'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { appendFiredAlert, alertStateAtom, firedAlertsAtom, watchlistAtom } from './atoms'
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

  const isWatched = useCallback(
    (marketId: string) => entries.some((e) => e.marketId === marketId),
    [entries],
  )

  const add = useCallback(
    (entry: Omit<WatchlistEntry, 'addedAt' | 'alertRules'>) => {
      setEntries((prev) => {
        if (prev.some((e) => e.marketId === entry.marketId)) return prev
        return [...prev, { ...entry, addedAt: new Date().toISOString(), alertRules: [] }]
      })
    },
    [setEntries],
  )

  const remove = useCallback(
    (marketId: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.marketId === marketId)
        if (!entry) return prev
        setAlertState((s) => {
          const next = { ...s }
          entry.alertRules.forEach((e) => delete next[e.id])
          return next
        })
        return prev.filter((e) => e.marketId !== marketId)
      })
    },
    [setEntries, setAlertState],
  )

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

  const addRule = useCallback(
    (rule: AlertRule) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.marketId === marketId ? { ...e, alertRules: [...e.alertRules, rule] } : e,
        ),
      )
    },
    [marketId, setEntries],
  )

  const updateRule = useCallback(
    (rule: AlertRule) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.marketId === marketId
            ? { ...e, alertRules: e.alertRules.map((r) => (r.id === rule.id ? rule : r)) }
            : e,
        ),
      )
    },
    [marketId, setEntries],
  )

  const removeRule = useCallback(
    (ruleId: string) => {
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
    },
    [marketId, setEntries, setAlertState],
  )

  const resetRule = useCallback(
    (ruleId: string) => {
      setAlertState((s) => ({
        ...s,
        [ruleId]: { ruleId, status: 'armed' },
      }))
    },
    [setAlertState],
  )

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

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }, [setAlerts])

  const clear = useCallback(() => {
    setAlerts([])
  }, [setAlerts])

  const appendAlert = useCallback(
    (alert: Parameters<typeof appendFiredAlert>[1]) => {
      setAlerts((prev) => appendFiredAlert(prev, alert))
    },
    [setAlerts],
  )

  return { alerts, unreadCount, markAllRead, clear, appendAlert }
}
