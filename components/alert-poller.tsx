'use client'

import { useAlertPoller } from '@/lib/alerts/use-alert-poller'

/** Headless component that drives the watchlist alert polling loop. */
export function AlertPoller() {
  useAlertPoller()
  return null
}
