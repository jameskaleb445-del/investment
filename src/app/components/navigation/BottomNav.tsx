'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { HiHome, HiChartBar, HiUser, HiPlus, HiUserGroup } from 'react-icons/hi'
import { FaWallet } from 'react-icons/fa'
import { cn } from '@/app/lib/utils'
import { GiCheckboxTree } from 'react-icons/gi'
import { FaRegCircleUser } from "react-icons/fa6";
import { SlChart } from "react-icons/sl";
import { RiHome2Line } from "react-icons/ri";
import { IoWalletOutline } from "react-icons/io5";
import { motion } from 'framer-motion'
import { useTheme } from '@/app/contexts/ThemeContext'

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const tNavigation = useTranslations('navigation')

  let theme: 'light' | 'dark' = 'light'
  try {
    theme = useTheme().theme
  } catch (error) {
    theme = 'light'
  }

  // Helper function to remove locale prefix from pathname
  const getPathWithoutLocale = (path: string) => {
    // Remove locale prefix if present (e.g., /fr/wallet -> /wallet)
    const localePattern = new RegExp(`^/(${['en', 'fr'].join('|')})(/|$)`)
    return path.replace(localePattern, '/') || '/'
  }

  const pathWithoutLocale = pathname ? getPathWithoutLocale(pathname) : '/'

  // Main pages that should show bottom nav (without locale prefix)
  const mainPages = ['/', '/marketplace', '/wallet', '/referrals', '/profile']
  
  // Check if current path is a main page (exact match or subpage for marketplace)
  const isMainPage = pathWithoutLocale && (
    mainPages.includes(pathWithoutLocale) || 
    pathWithoutLocale?.startsWith('/marketplace')
  )
  
  // Hide on auth pages
  if (!isMainPage || 
      pathWithoutLocale?.startsWith('/login') || 
      pathWithoutLocale?.startsWith('/register') || 
      pathWithoutLocale?.startsWith('/forgot-password') ||
      pathWithoutLocale?.startsWith('/verify-otp') ||
      pathWithoutLocale?.startsWith('/reset-password')) {
    return null
  }

  // Helper function to build href with locale prefix
  const buildHref = (path: string) => {
    if (locale === 'en') {
      return path // No prefix for default locale
    }
    // For non-default locales, add locale prefix
    if (path === '/') {
      return `/${locale}`
    }
    return `/${locale}${path}`
  }

  const navItems = [
    { href: buildHref('/'), icon: RiHome2Line, label: tNavigation('home') },
    { href: buildHref('/marketplace'), icon: SlChart, label: tNavigation('marketplace') },
    { href: buildHref('/wallet'), icon: IoWalletOutline, label: tNavigation('wallet'), isMiddle: true },
    { href: buildHref('/referrals'), icon: GiCheckboxTree, label: tNavigation('referrals') },
    { href: buildHref('/profile'), icon: FaRegCircleUser, label: tNavigation('profile') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] theme-bg-primary theme-border border-t transition-colors">
      <div className="max-w-md mx-auto">
        <div className="flex items-center w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const isWallet = item.isMiddle
            
            // Check if current route matches (exact match for main pages, or startsWith for marketplace)
            // Compare paths without locale prefix
            const itemPathWithoutLocale = getPathWithoutLocale(item.href)
            const isActive = pathWithoutLocale === itemPathWithoutLocale || 
                           (itemPathWithoutLocale === '/marketplace' && pathWithoutLocale?.startsWith('/marketplace'))
            
            // Middle item is the Wallet with plus button
            if (isWallet) {
              return (
                <div key={item.href} className="flex flex-1 flex-col items-center justify-center relative">
                  <Link
                    href={item.href}
                    className="flex items-center justify-center relative py-2"
                  >
                    <motion.div
                      className={cn(
                        "relative w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-md border",
                        isActive ? "shadow-[0_0_18px_rgba(139,92,246,0.35)]" : ""
                      )}
                      style={{
                        backgroundColor: isActive
                          ? '#8b5cf6'
                          : theme === 'dark'
                          ? '#2d2d35'
                          : '#ede9fe',
                        borderColor: isActive
                          ? 'transparent'
                          : theme === 'dark'
                          ? '#3a3a44'
                          : '#d8b4fe',
                      }}
                      animate={isActive ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0px rgba(139, 92, 246, 0)",
                          "0 0 20px rgba(139, 92, 246, 0.5)",
                          "0 0 0px rgba(139, 92, 246, 0)"
                        ]
                      } : {}}
                      transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    >
                      <motion.div
                        animate={isActive ? {
                          scale: [1, 1.15, 1]
                        } : {}}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                      >
                        <Icon className={cn(
                          "w-6 h-6 transition-colors"
                        )}
                        style={{
                          color: isActive
                            ? '#ffffff'
                            : theme === 'dark'
                            ? '#8b5cf6'
                            : '#6d28d9'
                        }}
                        />
                      </motion.div>
                    </motion.div>
                  </Link>
                  <span
                    className={cn(
                      "mt-1 text-[11px] font-medium transition-all duration-200",
                      isActive ? "opacity-100 translate-y-0 theme-text-primary" : "opacity-0 -translate-y-1 pointer-events-none"
                    )}
                  >
                    {item.label}
                  </span>
                  {/* Plus button overlay - triggers deposit */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Navigate to wallet with deposit action
                      router.push(`${buildHref('/wallet')}?action=deposit`)
                    }}
                    className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] flex items-center justify-center border-2 theme-border transition-colors cursor-pointer z-10 shadow-lg"
                  >
                    <HiPlus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center py-2 rounded-lg relative"
              >
                <motion.div
                  animate={isActive ? {
                    scale: [1, 1.2, 1],
                    y: [0, -4, 0]
                  } : {}}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={isActive ? {
                      scale: [1, 1.15, 1]
                    } : {}}
                    transition={{
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.1
                    }}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-colors",
                      isActive 
                        ? "text-[#8b5cf6]" 
                        : "theme-text-secondary hover:text-[#8b5cf6]"
                    )} />
                  </motion.div>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8b5cf6]"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "mt-1 text-[11px] font-medium transition-all duration-200",
                    isActive ? "opacity-100 translate-y-0 theme-text-primary" : "opacity-0 -translate-y-1 pointer-events-none"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
