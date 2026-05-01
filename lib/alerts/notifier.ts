import { toast } from 'sonner'

type NotifyOptions = {
  title: string
  body: string
  marketSlug: string
}

/**
 * Fires an in-app toast and, if the user has granted permission, a browser
 * Notification for the given alert.
 *
 * Designed as a thin abstraction: replace the body of this function to swap
 * delivery mechanisms (e.g. server-sent push) without touching call sites.
 */
export function notify({ title, body, marketSlug }: NotifyOptions) {
  toast(title, {
    description: body,
    action: {
      label: 'View',
      onClick: () => { window.location.href = `/markets/${marketSlug}` },
    },
    duration: 8_000,
  })

  if (typeof window !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}
