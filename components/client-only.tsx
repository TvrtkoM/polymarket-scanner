'use client'
import { useIsHydrated } from '@/lib/hooks'
import { ReactNode } from 'react'

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const hydrated = useIsHydrated()

  if (!hydrated) {
    return fallback ?? null
  }

  return children
}
