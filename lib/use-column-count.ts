'use client'

import { useSyncExternalStore } from 'react'

/**
 * Reads the current column count from the viewport via `window.matchMedia`.
 * Returns 3 at ≥ 1024 px, 2 at ≥ 640 px, 1 otherwise.
 */
function getColCount() {
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

/**
 * Registers `change` listeners on the `sm` (640 px) and `lg` (1024 px)
 * breakpoint media queries and calls `cb` on any change.
 * Returns a cleanup function that removes both listeners.
 *
 * @param cb - Callback invoked whenever a breakpoint boundary is crossed.
 */
function subscribeToColCount(cb: () => void) {
  const smQuery = window.matchMedia('(min-width: 640px)')
  const lgQuery = window.matchMedia('(min-width: 1024px)')
  smQuery.addEventListener('change', cb)
  lgQuery.addEventListener('change', cb)
  return () => {
    smQuery.removeEventListener('change', cb)
    lgQuery.removeEventListener('change', cb)
  }
}

/**
 * Returns the current responsive column count (1 / 2 / 3) derived from
 * media queries. Updates reactively on viewport resize.
 * SSR-safe: returns `1` on the server.
 */
export function useColumnCount() {
  return useSyncExternalStore(subscribeToColCount, getColCount, () => 1)
}
