'use client'

import { useState } from 'react'
import { formatCurrencyUSD, formatCurrency } from '@/app/utils/format'
import { HiEye, HiEyeOff, HiTrendingUp } from 'react-icons/hi'
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa'
import Link from 'next/link'
import { HiArrowPath, HiMiniArrowLongDown, HiMiniArrowLongUp } from 'react-icons/hi2'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from '@/app/components/ui/language-selector'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { useTheme } from '@/app/contexts/ThemeContext'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { NotificationsDropdown } from '@/app/components/notifications/NotificationsBottomSheet'

interface PortfolioHeaderProps {
  totalBalance: number
  totalInvested: number
  totalEarnings: number
  percentageChange?: number
}

export function PortfolioHeader({
  totalBalance,
  totalInvested,
  totalEarnings,
  percentageChange = 0,
}: PortfolioHeaderProps) {
  const t = useTranslations('home.quickActions')
  const tHome = useTranslations('home')
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const { theme } = useTheme()

  // Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        return null
      }
      const data = await response.json()
      return data
    },
  })

  const avatarUrl = profile?.avatar_url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'U'

  const totalAssetValue = totalBalance + totalInvested
  const calculatedPercentageChange =
    percentageChange !== 0
      ? percentageChange
      : totalBalance > 0
      ? parseFloat(((totalEarnings / totalBalance) * 100).toFixed(2))
      : 0

  const isPositiveChange = calculatedPercentageChange >= 0
  const percentageDisplay = calculatedPercentageChange.toFixed(2)

  const actionButtons = [
    { label: t('deposit'), icon: HiMiniArrowLongDown, href: '/wallet?action=deposit' },
    { label: t('withdraw'), icon: HiMiniArrowLongUp, href: '/wallet?action=withdraw' },
    { label: t('invest'), icon: HiTrendingUp, href: '/marketplace' },
  ]

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#7c3aed]" />
        <div
          className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b pointer-events-none ${
            theme === 'dark'
              ? 'from-transparent via-transparent to-[#0c0c12]/80'
              : 'from-transparent via-transparent to-[#ffffff]'
          }`}
        />

      <div className="relative px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/logos/PORFIT_B.png"
                alt="Profit Bridge"
                width={80}
                height={80}
                className="h-16 w-16 object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right side - Language, Theme, Notifications, Profile */}
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="compact" />
            <NotificationsDropdown />
            <Link 
              href="/profile" 
              className="text-white/80 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized={avatarUrl.includes('googleusercontent.com')}
                />
              </div>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/80 mb-2">{tHome('totalAssetValue')}</p>
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              {isBalanceVisible ? formatCurrency(totalAssetValue) : '••••••'}
            </h1>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              {isBalanceVisible ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                isPositiveChange
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {isPositiveChange ? '+' : ''}
              {percentageDisplay}%
            </span>
          </div>
          {isBalanceVisible && <p className="text-xs text-white/60">{formatCurrencyUSD(totalAssetValue)}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {actionButtons.map((button) => {
            const Icon = button.icon
            return (
              <Link key={button.label} href={button.href} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/20 bg-transparent shadow-lg group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                  {button.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
