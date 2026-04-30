import type { Severity } from "../types"

/** A single tradeable outcome within a {@link Market}. */
export type Outcome = {
  /** Display label shown to traders (e.g. `"Yes"`, `"No"`, `"Biden"`). */
  label: string
  /** Current implied probability expressed as a decimal (0–1). */
  price: number
}

/** UMA optimistic oracle dispute data for a market that went through propose/dispute cycles. */
export type MarketDisputes = {
  /** Outcome of the first proposal */
  proposedPrice: number
  /** Outcome re-proposed after first dispute, or null if not yet re-proposed. */
  reproposedPrice: number | null
}

/** A normalised prediction market, derived from a raw Polymarket API response. */
export type Market = {
  /** Unique market identifier. */
  id: string
  /** The question the market resolves on. */
  question: string
  /** URL-friendly identifier. */
  slug: string
  /** Market description */
  description: string;
  /** All tradeable outcomes for this market. */
  outcomes: Outcome[]
  /** CLOB trading volume over the last 24 hours, in USD. */
  volume24h: number
  /** CLOB trading volume over the last 7 days, in USD. */
  volume1wk: number
  /** Current liquidity available, in USD. */
  liquidity: number
  /** Scheduled resolution date, or `null` if open-ended. */
  endDate: string | null
  /** Whether the market is currently active. */
  active: boolean
  /** Whether the market is currently accepting orders. */
  acceptingOrders: boolean
  /** Price of the most recent trade, as a decimal (0–1). */
  lastTradePrice: number
  /** Highest current buy order price, as a decimal (0–1). */
  bestBid: number
  /** Lowest current sell order price, as a decimal (0–1). */
  bestAsk: number
  /** Difference between best ask and best bid, as a decimal. */
  spread: number
  /** Price change over the last 24 hours, as a signed decimal (e.g. `0.05` = +5%). */
  oneDayPriceChange: number
  /** Price change over the last 7 days, as a signed decimal. */
  oneWeekPriceChange: number
  /** Title of the parent event, or `null` if none. */
  eventTitle: string | null
  /** ID of the parent event, or `null` if none. */
  eventId: string | null
  /** URL slug of the parent event, or `null` if none. */
  eventSlug: string | null
  /** URL of the market's cover image, or `null` if none. */
  image: string | null
  /** Whether the market has an active or past UMA dispute. */
  disputed: boolean
  /** UMA question ID or `null` if none. */
  questionId: string | null
}

/** Mixin that attaches rule-engine signals to any type. */
export type WithSignals = {
  signals: Signal[]
}

/** A {@link Market} with signals attached from the rules engine. */
export type MarketWithSignals = Market & WithSignals

/** A signal emitted by a {@link Rule} when its condition is satisfied for a market. */
export type Signal = {
  /** ID of the {@link Market} that triggered the signal. */
  marketId: string
  /** Machine-readable rule name that produced this signal. */
  rule: string
  /** Human-readable explanation of why the signal fired. */
  description: string
  /** Urgency level of the signal. */
  severity: Severity;
}

/**
 * A rule function that inspects a single {@link Market} and returns a
 * {@link Signal} if its condition is met, or `null` otherwise.
 */
export type Rule = (market: Market) => Signal | null