'use client'

import { SettingsImportExport } from '@/components/settings-import-export'
import { NotificationPermission } from '@/components/notification-permission'

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>
      <div className="space-y-10">
        <NotificationPermission />
        <SettingsImportExport />
      </div>
    </main>
  )
}
