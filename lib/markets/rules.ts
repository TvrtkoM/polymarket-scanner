import { formatCurrency } from '../utils'
import { checkIsNearResolution, checkIsTossupMarket, checkPriceMove24h, checkVolumeSurge24h } from './conditions'
import type { Market, Rule, Signal } from './types'

/**
 * Fires when the absolute 24-hour price change is at least 10%.
 *
 * Severity thresholds:
 * - `'medium'` — change is ≥ 10% and < 20%.
 * - `'high'`   — change is ≥ 20%.
 *
 * @param market - The market to evaluate.
 * @returns A `'price_move_24h'` {@link Signal}, or `null` if the price
 * change is below the threshold.
 */
const significantPriceMove: Rule = (market) => {
  if (checkPriceMove24h(market).result) {
    return {
      marketId: market.id,
      ruleSlug: 'price_move_24h',
      description: `Price moved ${(market.oneDayPriceChange * 100).toFixed(1)}% in 24h`,
      severity: Math.abs(market.oneDayPriceChange) >= 0.2 ? 'high' : 'medium',
    }
  }
  return null
}

/**
 * Fires when the 24-hour trading volume exceeds $500,000.
 *
 * Severity thresholds:
 * - `'medium'` — volume is > $500k and ≤ $1M.
 * - `'high'`   — volume is > $1M.
 *
 * @param market - The market to evaluate.
 * @returns A `'volume_24h'` {@link Signal}, or `null` if volume is
 * below the threshold.
 */
const highVolumeSurge: Rule = (market) => {
  if (checkVolumeSurge24h(market).result) {
    return {
      marketId: market.id,
      ruleSlug: 'volume_24h',
      description: `${formatCurrency(market.volume24h)} volume in 24h`,
      severity: market.volume24h > 1_000_000 ? 'high' : 'medium',
    }
  }
  return null
}

/**
 * Fires when the market is scheduled to resolve within the next 7 days.
 * Markets without an `endDate` are silently skipped.
 *
 * Severity thresholds:
 * - `'low'`  — resolves in 3–7 days.
 * - `'high'` — resolves in ≤ 2 days.
 *
 * @param market - The market to evaluate.
 * @returns A `'near_resolution'` {@link Signal}, or `null` if the market has
 * no end date or resolves more than 7 days from now.
 */
const nearResolution: Rule = (market) => {
  const checkResult = checkIsNearResolution(market)
  if (checkResult.result) {
    return {
      marketId: market.id,
      ruleSlug: 'near_resolution',
      description: `Resolves in ${checkResult.payload.toFixed(0)} day(s)`,
      severity: checkResult.payload <= 2 ? 'high' : 'low',
    }
  }
  return null
}

/**
 * Fires when the "Yes" outcome price is between 40% and 60% inclusive,
 * indicating the market is too close to call.
 * Markets without a "Yes" outcome are silently skipped.
 *
 * Always produces a `'low'` severity signal because a tossup is informational
 * rather than urgent.
 *
 * @param market - The market to evaluate.
 * @returns A `'tossup'` {@link Signal}, or `null` if there is no "Yes" outcome
 * or its price is outside the 40–60% range.
 */
const tossupMarket: Rule = (market) => {
  const checkRes = checkIsTossupMarket(market)
  if (checkRes.result) {
    return {
      marketId: market.id,
      ruleSlug: 'tossup',
      description: `${checkRes.payload.label} at ${(checkRes.payload.price * 100).toFixed(0)}% — too close to call`,
      severity: 'low',
    }
  }
  return null
}

/**
 * The full set of rules evaluated against every market by {@link runRules}.
 * Add new {@link Rule} functions here to include them in signal generation.
 */
const RULES: Rule[] = [significantPriceMove, highVolumeSurge, nearResolution, tossupMarket]

/**
 * Evaluates all registered {@link RULES} against a single market.
 *
 * @param market - The normalised market to analyse.
 * @returns An array of {@link Signal} objects for each rule that fired. Empty if none fire.
 */
export function runRules(market: Market): Signal[] {
  return RULES.map((rule) => rule(market)).filter((s) => s != null)
}
