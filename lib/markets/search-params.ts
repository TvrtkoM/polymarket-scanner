import {
  createLoader,
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  type inferParserType,
} from 'nuqs/server'
import { sortKeys } from './constants'

/**
 * nuqs parsers for markets list filter/sort params.
 * Keys match the exact Polymarket API parameter names so they can be spread
 * directly into the API query without any name-mapping.
 */
export const marketsSearchParsers = {
  order: parseAsStringLiteral(sortKeys).withDefault('volume24hrClob'),
  liquidity_num_min: parseAsInteger.withDefault(1000),
  closed: parseAsBoolean.withDefault(false),
}

/** Typed shape of the markets filter/sort params, inferred from the parsers. */
export type MarketsParams = inferParserType<typeof marketsSearchParsers>

/** For use in React server components (uses React's `cache` internally). */
export const marketsSearchParamsCache = createSearchParamsCache(marketsSearchParsers)

/** For use in route handlers (no React cache context). */
export const loadMarketsSearchParams = createLoader(marketsSearchParsers)
