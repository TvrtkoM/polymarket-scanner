import type { Market } from './types'

type CheckResult<P = undefined> =
  | { result: false }
  | (P extends undefined ? { result: true } : { result: true; payload: P })

/**
 * Returns `true` when the absolute 24-hour price change meets or exceeds the threshold.
 *
 * @param market - The market to evaluate.
 * @param threshold - Minimum absolute price change (as a decimal fraction) to trigger.
 * @defaultValue threshold `0.1`
 * @returns `true` if the absolute 24-hour price change is ≥ `threshold`.
 */
export function checkPriceMove24h(market: Market, threshold = 0.1): CheckResult {
  return Math.abs(market.oneDayPriceChange) >= threshold ? { result: true } : { result: false }
}

/**
 * Returns `true` when the 24-hour trading volume meets or exceeds the threshold.
 *
 * @param market - The market to evaluate.
 * @param threshold - Minimum 24-hour volume in USD to trigger.
 * @defaultValue threshold `500_000`
 * @returns `true` if the 24-hour volume is ≥ `threshold`.
 */
export function checkVolumeSurge24h(market: Market, threshold = 500_000): CheckResult {
  return market.volume24h >= threshold ? { result: true } : { result: false }
}

/**
 * Returns `true` when a named outcome's price has crossed a threshold in the given direction.
 * Markets that do not contain the specified outcome always return `false`.
 *
 * @param market - The market to evaluate.
 * @param outcomeLabel - Label of the outcome to inspect (e.g. `"Yes"`).
 * @param direction - `'above'` to test `price >= threshold`; `'below'` to test `price <= threshold`.
 * @param threshold - The price level (as a decimal fraction) to compare against.
 * @returns `true` if the outcome exists and its price satisfies the directional condition.
 */
export function checkOutcomePriceCrossed(
  market: Market,
  outcomeLabel: string,
  direction: 'above' | 'below',
  threshold: number,
): CheckResult<number> {
  const outcome = market.outcomes.find((o) => o.label === outcomeLabel)
  if (!outcome) {
    return { result: false }
  }
  const result = direction === 'above' ? outcome.price >= threshold : outcome.price <= threshold
  return result ? { result: true, payload: outcome.price } : { result: false }
}

/**
 * Returns `true` when the market is scheduled to resolve within the given number of days.
 * Markets without an `endDate` always return `false`.
 *
 * @param market - The market to evaluate.
 * @param days - Window in days within which the market must resolve to trigger.
 * @defaultValue days `7`
 * @returns `true` if the market resolves between now and `days` days from now.
 */
export function checkIsNearResolution(market: Market, days = 7): CheckResult<number> {
  if (!market.endDate) {
    return { result: false }
  }
  const daysLeft = (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return daysLeft <= days && daysLeft > 0 ? { result: true, payload: daysLeft } : { result: false }
}

/**
 * Returns `true` when the specified outcome's price falls in the 40–60% range,
 * indicating the market is too close to call. Markets without the outcome return `false`.
 *
 * @param market - The market to evaluate.
 * @param outcomeLabel - Label of the outcome to inspect. Defaults to the first outcome.
 * @returns `true` if the outcome price is between 0.4 and 0.6 inclusive.
 */
export function checkIsTossupMarket(
  market: Market,
  outcomeLabel?: string,
): CheckResult<{ label: string; price: number }> {
  const outcome = outcomeLabel != null ? market.outcomes.find((o) => o.label === outcomeLabel) : market.outcomes[0]
  if (!outcome) {
    return { result: false }
  }
  return outcome.price >= 0.4 && outcome.price <= 0.6
    ? { result: true, payload: { price: outcome.price, label: outcome.label } }
    : { result: false }
}
