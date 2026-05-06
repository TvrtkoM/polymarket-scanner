import {
  createLoader,
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  type inferParserType,
} from 'nuqs/server'
import { RESOLUTION_STATUSES, sortKeys } from './constants'

/**
 * nuqs parsers for markets list filter/sort params.
 * Keys match the exact Polymarket API parameter names so they can be spread
 * directly into the API query without any name-mapping.
 */
export const marketsSearchParsers = {
  order: parseAsStringLiteral(sortKeys).withDefault('volume24hrClob'),
  liquidity_num_min: parseAsInteger.withDefault(1000),
  uma_resolution_status: parseAsStringLiteral([...RESOLUTION_STATUSES, '']).withDefault(''),
  closed: parseAsBoolean.withDefault(false),
}

/** Typed shape of the markets filter/sort params, inferred from the parsers. */
export type MarketsParams = inferParserType<typeof marketsSearchParsers>

/** For use in React server components (uses React's `cache` internally). */
export const marketsSearchParamsCache = createSearchParamsCache(marketsSearchParsers)

/** For use in route handlers (no React cache context). */
export const loadMarketsSearchParams = createLoader(marketsSearchParsers)

/**
 * Builds the react-query key for the markets infinite query.
 * Keep all consumers (prefetch, list, cache invalidation) in sync by importing this.
 */
export const marketsQueryKey = (params: MarketsParams) =>
  ['markets', params.order, params.liquidity_num_min, params.uma_resolution_status, params.closed] as const
