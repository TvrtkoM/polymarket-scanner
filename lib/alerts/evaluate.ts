import {
  checkIsNearResolution,
  checkOutcomePriceCrossed,
  checkPriceMove24h,
  checkVolumeSurge24h,
} from '../markets/conditions'
import type { Market } from '../markets/types'
import { formatCurrency, formatSignedPercent } from '../utils'
import type { AlertRule, AlertRuleState } from '../watchlist/types'

type EvaluateResult = { fired: true; message: string } | { fired: false }

/**
 * Evaluates a single alert rule against the current market snapshot.
 *
 * Returns `fired: false` when:
 * - The rule's state is already `'fired'` (first-crossing semantics; re-arm
 *   requires explicit user action via `resetRule` from {@link useAlertRules}).
 * - The rule's condition is not currently met.
 *
 * This function is pure — no I/O, no React, no storage — so it can be
 * reused from a server-side worker if the architecture evolves.
 *
 * @param rule - The rule to evaluate.
 * @param market - Current market snapshot.
 * @param state - Persisted arm/fire state for this rule, or `undefined` if
 *   it has never fired.
 */
export function evaluateRule(rule: AlertRule, market: Market, state: AlertRuleState | undefined): EvaluateResult {
  if (state?.status === 'fired') return { fired: false }

  switch (rule.ruleSlug) {
    case 'price_cross': {
      const checkResult = checkOutcomePriceCrossed(market, rule.outcomeLabel, rule.direction, rule.threshold)
      return checkResult.result
        ? {
            fired: true,
            message: `${rule.outcomeLabel} price is ${(checkResult.payload * 100).toFixed(1)}% — ${rule.direction} ${(rule.threshold * 100).toFixed(0)}%`,
          }
        : { fired: false }
    }

    case 'price_move_24h': {
      return checkPriceMove24h(market, rule.absChange).result
        ? {
            fired: true,
            message: `24h price move: ${formatSignedPercent(market.oneDayPriceChange)} (threshold ≥ ${formatSignedPercent(rule.absChange)})`,
          }
        : { fired: false }
    }

    case 'volume_24h': {
      return checkVolumeSurge24h(market, rule.threshold).result
        ? {
            fired: true,
            message: `24h volume ${formatCurrency(market.volume24h)} exceeds ${formatCurrency(rule.threshold)}`,
          }
        : { fired: false }
    }

    case 'near_resolution': {
      const checkResult = checkIsNearResolution(market, rule.daysLeft)
      if (!checkResult.result) return { fired: false }
      const daysLeft = checkResult.payload
      return {
        fired: true,
        message: `Resolves in ${daysLeft.toFixed(0)} day(s) (threshold ≤ ${rule.daysLeft})`,
      }
    }
  }
}
