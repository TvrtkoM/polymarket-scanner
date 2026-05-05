import { SettingsImportExport } from '@/components/settings-import-export'
import { NotificationPermission } from '@/components/notification-permission'

export const metadata = { title: 'Settings' }

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
