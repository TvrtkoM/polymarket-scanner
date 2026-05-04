'use client'

import { SettingsImportExport } from '@/components/settings-import-export'
import { NotificationPermission } from '@/components/notification-permission'

export default function SettingsPage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>
      <div className="space-y-10">
        <NotificationPermission />
        <SettingsImportExport />
      </div>
    </>
  )
}
