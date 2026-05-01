import { formatCurrency, formatSignedPercent } from '../utils'
import type { Market } from '../markets/types'
import type { AlertRule, AlertRuleState } from '../watchlist/types'

type EvaluateResult =
  | { fired: true; message: string }
  | { fired: false }

/**
 * Evaluates a single alert rule against the current market snapshot.
 *
 * Returns `fired: false` when:
 * - The rule's state is already `'fired'` (first-crossing semantics; re-arm
 *   requires explicit user action via {@link useAlertRules.resetRule}).
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
export function evaluateRule(
  rule: AlertRule,
  market: Market,
  state: AlertRuleState | undefined,
): EvaluateResult {
  if (state?.status === 'fired') return { fired: false }

  switch (rule.kind) {
    case 'price_cross': {
      const outcome = market.outcomes.find((o) => o.label === rule.outcomeLabel)
      if (!outcome) return { fired: false }
      const crossed =
        rule.direction === 'above'
          ? outcome.price >= rule.threshold
          : outcome.price <= rule.threshold
      if (!crossed) return { fired: false }
      return {
        fired: true,
        message: `${rule.outcomeLabel} price is ${(outcome.price * 100).toFixed(1)}% — ${rule.direction} ${(rule.threshold * 100).toFixed(0)}%`,
      }
    }

    case 'price_move_24h': {
      if (Math.abs(market.oneDayPriceChange) < rule.absChange) return { fired: false }
      return {
        fired: true,
        message: `24h price move: ${formatSignedPercent(market.oneDayPriceChange)} (threshold ≥ ${formatSignedPercent(rule.absChange)})`,
      }
    }

    case 'volume_24h': {
      if (market.volume24h <= rule.threshold) return { fired: false }
      return {
        fired: true,
        message: `24h volume ${formatCurrency(market.volume24h)} exceeds ${formatCurrency(rule.threshold)}`,
      }
    }

    case 'near_resolution': {
      if (!market.endDate) return { fired: false }
      const daysLeft = (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft > rule.daysLeft || daysLeft <= 0) return { fired: false }
      return {
        fired: true,
        message: `Resolves in ${daysLeft.toFixed(0)} day(s) (threshold ≤ ${rule.daysLeft})`,
      }
    }
  }
}
