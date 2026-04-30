import {
  createLoader,
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  type inferParserType,
} from 'nuqs/server'

/**
 * nuqs parsers for markets list filter/sort params.
 * Keys match the exact Polymarket API parameter names so they can be spread
 * directly into the API query without any name-mapping.
 */
export const marketsSearchParsers = {
  order: parseAsString.withDefault('volume24hrClob'),
  liquidity_num_min: parseAsInteger.withDefault(1000),
  tag_match: parseAsString.withDefault(''),
}

/** Typed shape of the markets filter/sort params, inferred from the parsers. */
export type MarketsParams = inferParserType<typeof marketsSearchParsers>

/** For use in React server components (uses React's `cache` internally). */
export const marketsSearchParamsCache = createSearchParamsCache(marketsSearchParsers)

/** For use in route handlers (no React cache context). */
export const loadMarketsSearchParams = createLoader(marketsSearchParsers)

/** Display labels for the sort options exposed in the UI. */
export const SORT_OPTIONS: Record<string, string> = {
  volume24hrClob: 'Most volume 24h',
  volume1wkClob: 'Most volume 1wk',
  liquidity: 'Most liquid',
  endDate: 'Ending soon',
}
