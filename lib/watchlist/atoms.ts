import { atomWithStorage } from 'jotai/utils'
import type { AlertRuleState, FiredAlert, WatchlistEntry } from './types'

const FIRED_ALERTS_MAX = 200

/**
 * Persisted list of markets the user is watching.
 * Key uses a version suffix so future schema migrations can bump the version
 * without clobbering existing data.
 */
export const watchlistAtom = atomWithStorage<WatchlistEntry[]>('watchlist:v1', [])

/**
 * Per-rule arm/fire state, keyed by rule id.
 * Drives first-crossing semantics: a rule won't refire until manually reset.
 */
export const alertStateAtom = atomWithStorage<Record<string, AlertRuleState>>('alerts:state:v1', {})

/**
 * Ring-buffer of the last {@link FIRED_ALERTS_MAX} fired alerts.
 * Older entries are dropped when the buffer is full.
 */
export const firedAlertsAtom = atomWithStorage<FiredAlert[]>('alerts:fired:v1', [], undefined, {
  getOnInit: true,
})

/** Appends a fired alert, evicting the oldest if the buffer is full. */
export function appendFiredAlert(prev: FiredAlert[], next: FiredAlert): FiredAlert[] {
  const updated = [next, ...prev]
  return updated.length > FIRED_ALERTS_MAX ? updated.slice(0, FIRED_ALERTS_MAX) : updated
}
