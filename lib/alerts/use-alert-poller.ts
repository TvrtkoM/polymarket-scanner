'use client'

import { fetchWatchedMarkets } from '@/lib/markets/client-api'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { alertStateAtom, appendFiredAlert, firedAlertsAtom, watchlistAtom } from '../watchlist/atoms'
import { evaluateRule } from './evaluate'
import { notify } from './notifier'

/**
 * Headless hook that drives the watchlist polling loop.
 *
 * - Fetches all watched markets in a single batched request every 30 seconds.
 * - Evaluates every alert rule against fresh data.
 * - On first crossing: records the fired alert, updates rule state, and fires
 *   a toast (+ browser notification if permission granted).
 *
 * Mount this once at the app shell level via `<AlertPoller />` so alerts work
 * regardless of which page the user is viewing.
 *
 * To swap this for a WebSocket-driven version later, replace only this hook.
 */
export function useAlertPoller() {
  const watchlist = useAtomValue(watchlistAtom)
  const [alertState, setAlertState] = useAtom(alertStateAtom)
  const [, setFiredAlerts] = useAtom(firedAlertsAtom)

  const ids = watchlist.map((e) => e.marketId)
  const sortedIds = [...ids].sort()

  const { data: markets } = useQuery({
    queryKey: ['watchlist-markets', sortedIds],
    queryFn: () => fetchWatchedMarkets(ids),
    enabled: ids.length > 0,
    refetchInterval: 30_000,
    staleTime: 25_000,
  })

  useEffect(() => {
    if (!markets || markets.length === 0) return

    const marketMap = new Map(markets.map((m) => [m.id, m]))

    for (const entry of watchlist) {
      const market = marketMap.get(entry.marketId)
      if (!market) continue

      for (const rule of entry.alertRules) {
        const state = alertState[rule.id]
        const result = evaluateRule(rule, market, state)

        if (!result.fired) continue

        const firedAt = new Date().toISOString()

        setAlertState((prev) => ({
          ...prev,
          [rule.id]: { ruleId: rule.id, status: 'fired', firedAt },
        }))

        setFiredAlerts((prev) =>
          appendFiredAlert(prev, {
            id: `${rule.id}-${firedAt}`,
            ruleId: rule.id,
            marketId: entry.marketId,
            slug: entry.slug,
            question: entry.question,
            message: result.message,
            firedAt,
            read: false,
          }),
        )

        notify({
          title: entry.question,
          body: result.message,
          marketSlug: entry.slug,
        })
      }
    }
  }, [markets, watchlist, alertState, setAlertState, setFiredAlerts])
}
