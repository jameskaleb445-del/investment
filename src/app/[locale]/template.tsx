'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Helper function to remove locale prefix from pathname for checking
  const getPathWithoutLocale = (path: string) => {
    const localePattern = new RegExp(`^/(${['en', 'fr', 'es'].join('|')})(/|$)`)
    return path.replace(localePattern, '/') || '/'
  }

  const pathWithoutLocale = pathname ? getPathWithoutLocale(pathname) : '/'

  // Don't animate auth pages
  const isAuthPage = pathWithoutLocale?.startsWith('/login') || 
                     pathWithoutLocale?.startsWith('/register') || 
                     pathWithoutLocale?.startsWith('/forgot-password') ||
                     pathWithoutLocale?.startsWith('/verify-otp') ||
                     pathWithoutLocale?.startsWith('/reset-password')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="relative overflow-hidden bg-[#1a1a1f]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{
            type: 'tween',
            ease: [0.16, 1, 0.3, 1],
            duration: 0.28,
          }}
          className="w-full bg-[#1a1a1f]"
          style={{
            minHeight: '100vh',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
