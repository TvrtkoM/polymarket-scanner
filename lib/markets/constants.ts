import type { MarketSortKey, RuleSlug } from './types'

/** Polymarket Gamma API base url */
export const GAMMA_API_URL = 'https://gamma-api.polymarket.com'

/** Polymarket Data API base url */
export const DATA_API_URL = 'https://data-api.polymarket.com'

/** Number of markets returned per page from the `/api/markets` endpoint. */
export const marketsPageCount = 18

export const sortKeys = ['volume24hrClob', 'volume1wkClob', 'liquidity', 'endDate'] as const

/** Display labels for the sort options exposed in the UI. */
export const SORT_OPTIONS: Record<MarketSortKey, string> = {
  volume24hrClob: 'Most volume 24h',
  volume1wkClob: 'Most volume 1wk',
  liquidity: 'Most liquid',
  endDate: 'Ending soon',
}

/** RuleId / label pairs for display in UI */
export const RULES_LABELS: Record<RuleSlug, string> = {
  price_cross: 'Price crosses threshold',
  price_move_24h: 'Price move in 24h',
  volume_24h: 'Volume in 24h',
  near_resolution: 'Near resolution',
  tossup: 'Tossup (too close to call)',
} as const
