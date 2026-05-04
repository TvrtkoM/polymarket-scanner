'use client'

import { getQueryClient } from '@/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={getQueryClient()}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </JotaiProvider>
  )
}
