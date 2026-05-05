import { useSyncExternalStore } from 'react'

/**
 * Returns `true` once the component has hydrated on the client, `false` during SSR.
 * Uses {@link useSyncExternalStore} to safely bridge the server/client boundary.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
