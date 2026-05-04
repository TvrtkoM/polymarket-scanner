import type { RuleSlug } from '../markets/types'

/** The discriminated kind of an {@link AlertRule}. */
export type AlertRuleSlug = Exclude<RuleSlug, 'tossup'>

/**
 * A single alert rule attached to a watched market.
 * Discriminated union on `ruleId` keeps the evaluator a clean switch and makes
 * adding new rules a localised change.
 */
export type AlertRule =
  | {
      id: string
      ruleSlug: 'price_cross'
      outcomeLabel: string
      direction: 'above' | 'below'
      threshold: number
    }
  | { id: string; ruleSlug: 'price_move_24h'; absChange: number }
  | { id: string; ruleSlug: 'volume_24h'; threshold: number }
  | { id: string; ruleSlug: 'near_resolution'; daysLeft: number }

/**
 * Tracks whether a rule has fired and when.
 * Status starts `'armed'`; transitions to `'fired'` on first crossing;
 * resets to `'armed'` only on explicit user action (manual reset).
 */
export type AlertRuleState = {
  ruleId: string
  status: 'armed' | 'fired'
  firedAt?: string
}

/** A market the user has added to their watchlist. */
export type WatchlistEntry = {
  /** Polymarket market id. */
  marketId: string
  /** URL slug, used for routing. */
  slug: string
  /** Cached question text for rendering the list before the live fetch resolves. */
  question: string
  /** ISO timestamp of when the entry was added. */
  addedAt: string
  /** Alert rules configured for this market. */
  alertRules: AlertRule[]
}

/** A record of an alert rule that fired. Stored in a bounded history ring-buffer. */
export type FiredAlert = {
  /** Unique id for this firing event. */
  id: string
  /** The rule id that produced this alert. */
  ruleId: string
  /** Market id the rule was attached to. */
  marketId: string
  /** Market slug for routing. */
  slug: string
  /** Cached market question for display. */
  question: string
  /** Human-readable message describing why it fired. */
  message: string
  /** ISO timestamp. */
  firedAt: string
  /** Whether the user has seen this alert in the alert center. */
  read: boolean
}
