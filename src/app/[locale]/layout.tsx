import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import '../globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from '../components/ui/toaster'
import { TopLoadingBar } from '../components/ui/top-loading-bar'

export const metadata: Metadata = {
  title: 'Investment Platform - Rapid Return Assets',
  description: 'Invest in physical assets with rapid returns',
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
      <body className="antialiased bg-[#1a1a1f]">
        <NextIntlClientProvider messages={messages}>
          <TopLoadingBar />
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

