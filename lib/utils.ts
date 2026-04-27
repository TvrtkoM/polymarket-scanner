import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Formats a dollar amount into a compact, human-readable string with K/M suffixes.
 *
 * @param amount - The raw dollar value to format.
 * @param decimals - Decimal places to show when no suffix applies.
 * @defaultValue decimals `0`
 * @returns A prefixed string such as `$1.2M`, `$430K`, or `$99`.
 */
export function formatCurrency(amount: number, decimals = 0) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(decimals)}`;
}

/**
 * Formats a decimal fraction as a signed percentage string.
 *
 * @param fraction - A value in [−1, 1] representing the change (e.g. `0.05` for 5%).
 * @returns A string such as `+5.0%` or `-2.3%`.
 */
export function formatSignedPercent(fraction: number) {
  const sign = fraction >= 0 ? "+" : "";
  return `${sign}${(fraction * 100).toFixed(1)}%`;
}

/**
 * Formats an ISO date string into a human-readable date and time.
 *
 * @param dateStr - An ISO 8601 date string (e.g. `"2025-04-28T14:30:00Z"`).
 * @returns A locale string such as `"Apr 28, 2025, 02:30 PM"`.
 */
export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    minute: '2-digit',
    hour: '2-digit'
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}