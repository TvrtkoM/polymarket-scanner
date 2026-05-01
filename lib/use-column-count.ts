'use client'

import { useSyncExternalStore } from 'react'

function getColCount() {
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

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
