import { MarketsParams } from './search-params'

/**
 * Builds the react-query key for the markets infinite query.
 * Keep all consumers (prefetch, list, cache invalidation) in sync by importing this.
 */
export const marketsQueryKey = (params: MarketsParams) =>
  ['markets', params.order, params.liquidity_num_min, params.uma_resolution_status, params.closed] as const
