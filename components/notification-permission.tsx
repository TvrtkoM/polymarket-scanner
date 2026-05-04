'use client'

import { Button } from '@/components/ui/button'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { useSyncExternalStore } from 'react'

function getPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function subscribe(cb: () => void) {
  // Notification.permission is not an event emitter; we re-check on focus.
  window.addEventListener('focus', cb)
  return () => window.removeEventListener('focus', cb)
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{children}</h2>
}

export function NotificationPermission() {
  const permission = useSyncExternalStore(subscribe, getPermission, () => 'default' as const)

  const request = async () => {
    if (!('Notification' in window)) return
    await Notification.requestPermission()
  }

  if (permission === 'unsupported') return null

  return (
    <div>
      <SectionHeading>Browser notifications</SectionHeading>
      <p className="text-sm text-muted-foreground mb-4">
        Allow browser notifications to receive alerts even when your focus is on another tab. Alerts always appear as
        toasts within the app regardless of this setting.
      </p>
      {permission === 'granted' ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <BellRing className="size-4" />
          Notifications enabled
        </div>
      ) : permission === 'denied' ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellOff className="size-4" />
          Notifications blocked — enable them in your browser settings.
        </div>
      ) : (
        <Button variant="outline" onClick={request}>
          <Bell className="size-4" />
          Enable browser notifications
        </Button>
      )}
    </div>
  )
}
