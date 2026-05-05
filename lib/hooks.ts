import { useSyncExternalStore } from 'react'

export function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
