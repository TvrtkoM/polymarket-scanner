import { clsx, type ClassValue } from 'clsx'
import Decimal from 'decimal.js'
import { twMerge } from 'tailwind-merge'

/**
 * Formats a dollar amount into a compact, human-readable string with K/M suffixes.
 *
 * @param amount - The raw dollar value to format.
 * @param decimals - Decimal places to show when no suffix applies.
 * @defaultValue decimals `0`
 * @returns A prefixed string such as `$1.2M`, `$430K`, or `$99`.
 */
export function formatCurrency(amount: number, decimals = 0) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(decimals)}`
}

/**
 * Formats a decimal fraction as a signed percentage string.
 *
 * @param fraction - A value in [−1, 1] representing the change (e.g. `0.05` for 5%).
 * @returns A string such as `+5.0%` or `-2.3%`.
 */
export function formatSignedPercent(fraction: number) {
  const sign = fraction >= 0 ? '+' : ''
  return `${sign}${(fraction * 100).toFixed(1)}%`
}

/**
 * Formats an ISO date string into a human-readable date and time.
 *
 * @param dateStr - An ISO 8601 date string (e.g. `"2025-04-28T14:30:00Z"`).
 * @returns A locale string such as `"Apr 28, 2025, 02:30 PM"`.
 */
export function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    minute: '2-digit',
    hour: '2-digit',
  })
}

/**
 * Formats a number as a signed string with two decimal places.
 *
 * @param value - The numeric value to format.
 * @returns A string such as `+1.50` or `-0.75`, always including the sign for non-negative values.
 */
export function formatSigned(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatPrice(value)}`
}

/**
 * Formats a price value to a given number of significant digits.
 *
 * @param value - The numeric price to format.
 * @param significantDigits - Number of significant digits to display. Defaults to `4`.
 * @returns A string representation of the price rounded to `significantDigits` significant digits.
 */
export function formatPrice(value: number, significantDigits = 4) {
  return new Decimal(value).toSignificantDigits(significantDigits).toString()
}

/**
 * Merges Tailwind class names, resolving conflicts via `tailwind-merge` and
 * handling conditional classes via `clsx`.
 *
 * @param inputs - Any mix of strings, arrays, or conditional class objects accepted by `clsx`.
 * @returns A single deduplicated, conflict-resolved class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a UMA wei-encoded price string into a decimal number.
 *
 * @param s - A wei string such as `"0"` or `"1000000000000000000"`.
 * @returns `0` for No or `1` for Yes.
 */
export function parseWeiPrice(s: string): number {
  return new Decimal(s).div(new Decimal('1e18')).toNumber()
}

/**
 * Converts a loose record to `Record<string, string>`, omitting entries that are
 * `null`, `undefined`, or empty string. The result is directly usable with
 * `new URLSearchParams`.
 *
 * @param input - Object whose values may be string, number, boolean, null, or undefined.
 * @returns A new object with only defined, non-empty values coerced to strings.
 */
export function toStringRecord(
  input: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)]),
  )
}
