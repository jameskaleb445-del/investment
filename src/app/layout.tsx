import './globals.css'
import { defaultLocale } from '../i18n/config'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className="antialiased theme-bg-primary transition-colors">
        {children}
      </body>
    </html>
  )
}
