'use client'

import { useState } from 'react'
import { formatCurrencyUSD, formatCurrency } from '@/app/utils/format'
import { HiEye, HiEyeOff, HiBell, HiDocumentText, HiTrendingUp } from 'react-icons/hi'
import { FaArrowUp, FaArrowDown, FaChartLine, FaExchangeAlt, FaRegBell, FaRegUserCircle } from 'react-icons/fa'
import { IoPersonCircleOutline } from 'react-icons/io5'
import Link from 'next/link'
import { HiArrowPath, HiMiniArrowLongDown, HiMiniArrowLongUp } from 'react-icons/hi2'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from '@/app/components/ui/language-selector'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'

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
  
  // Calculate total asset value (balance + invested)
  const totalAssetValue = totalBalance + totalInvested
  
  // Calculate percentage change from earnings (mock calculation)
  const calculatedPercentageChange = percentageChange !== 0 
    ? percentageChange 
    : totalBalance > 0 
      ? parseFloat(((totalEarnings / totalBalance) * 100).toFixed(2))
      : 0

  const isPositiveChange = calculatedPercentageChange >= 0
  const percentageDisplay = calculatedPercentageChange.toFixed(2)

  const actionButtons = [
    {
      label: t('deposit'),
      icon: HiMiniArrowLongDown ,
      href: '/wallet?action=deposit',
      bgColor: 'bg-[#8b5cf6]',
      color: '#8b5cf6',
    },
    {
      label: t('withdraw'),
      icon: HiMiniArrowLongUp,
      href: '/wallet?action=withdraw',
      bgColor: 'bg-[#3b82f6]',
      color: '#3b82f6',
    },
    {
      label: t('invest'),
      icon: HiTrendingUp,
      href: '/marketplace',
      bgColor: 'bg-[#10b981]',
      color: '#10b981',
    },
    {
      label: t('transfer'),
      icon: HiArrowPath,
      href: '/wallet?action=transfer',
      bgColor: 'bg-[#f59e0b]',
      color: '#f59e0b',
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative px-4 pt-6 pb-6 overflow-visible">
        {/* Top Bar - Language, Theme, Notifications and Profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 relative z-10">
            <LanguageSelector variant="compact" className="flex-shrink-0" />
            <ThemeToggle variant="compact" />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors cursor-pointer relative">
              <FaRegBell  className="w-6 h-6" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
           
            <Link href="/profile" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              <FaRegUserCircle  className="w-7 h-7" />
            </Link>
          </div>
        </div>

        {/* Total Asset Value Section */}
        <div className="mb-6">
          <p className="text-sm text-white/80 mb-2">{tHome('totalAssetValue')}</p>
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              {isBalanceVisible ? formatCurrencyUSD(totalAssetValue) : '••••••'}
            </h1>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1"
            >
              {isBalanceVisible ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
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
          
          {isBalanceVisible && (
            <p className="text-xs text-white/60">
              {formatCurrency(totalAssetValue)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 relative z-10">
          {actionButtons.map((button) => {
            const Icon = button.icon
            return (
              <Link
                key={button.label}
                href={button.href}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-transform relative z-10 bg-transparent border-2 border-white/20" 
                >
                  <Icon className="w-6 h-6 text-white relative z-10" />
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

