'use client'

import { ErrorComponent } from '@/components/error'

export default function MarketsError({ error, unstable_retry }: { error: Error; unstable_retry: () => void }) {
  return <ErrorComponent error={error} onRetry={unstable_retry} />
}
