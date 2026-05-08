import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { AlertPoller } from '@/components/alerts/alert-poller'
import { Header } from '@/components/header'
import Providers from './providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { template: '%s | Polymarket Scanner', default: 'Polymarket Scanner' },
  description:
    'Active Polymarket prediction markets alongside computed trading signals to help inform trading decisions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Providers>
            <AlertPoller />
            <Header />
            <main className="pt-6">{children}</main>
          </Providers>
          <Toaster richColors closeButton />
        </div>
      </body>
    </html>
  )
}
