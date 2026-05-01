import type { AlertRuleState, FiredAlert, WatchlistEntry } from '../watchlist/types'

/** Version tag for the export envelope. Bump when the schema changes. */
const CURRENT_VERSION = 1 as const

/**
 * The JSON envelope written by {@link exportAll} and read by {@link importAll}.
 * The `version` field allows future migrations before writing to atoms.
 */
export type ExportEnvelope = {
  version: typeof CURRENT_VERSION
  exportedAt: string
  watchlist: WatchlistEntry[]
  firedAlerts: FiredAlert[]
  alertState: Record<string, AlertRuleState>
}

/**
 * Serialises the three persisted stores into an {@link ExportEnvelope} JSON
 * string and triggers a browser download.
 */
export function exportAll(
  watchlist: WatchlistEntry[],
  firedAlerts: FiredAlert[],
  alertState: Record<string, AlertRuleState>,
): void {
  const envelope: ExportEnvelope = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    watchlist,
    firedAlerts,
    alertState,
  }

  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `polymarkets-watchlist-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Parses and validates an imported JSON string.
 *
 * @returns The validated {@link ExportEnvelope} on success.
 * @throws `Error` with a human-readable message when the JSON is malformed or
 * the version is unrecognised.
 */
export function parseImport(json: string): ExportEnvelope {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON file.')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as Record<string, unknown>).version !== CURRENT_VERSION
  ) {
    throw new Error(`Unrecognised export version. Expected version ${CURRENT_VERSION}.`)
  }

  return parsed as ExportEnvelope
}
