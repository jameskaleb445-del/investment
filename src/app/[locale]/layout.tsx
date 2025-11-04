import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n/config'
import '../globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Toaster } from '../components/ui/toaster'
import { TopLoadingBar } from '../components/ui/top-loading-bar'
import { Suspense } from 'react'
import { PWARegistration } from '../components/pwa/PWARegistration'
import { InstallPrompt } from '../components/pwa/InstallPrompt'

export const metadata: Metadata = {
  title: 'Investment Platform - Rapid Return Assets',
  description: 'Invest in physical assets with rapid returns',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Investment App',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export function generateViewport() {
  return {
    themeColor: '#1a1a1f',
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Get messages for the current locale
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="antialiased theme-bg-primary transition-colors">
        <PWARegistration />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={null}>
              <TopLoadingBar />
            </Suspense>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
            <InstallPrompt />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

