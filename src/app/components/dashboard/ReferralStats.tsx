'use client'

import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { HiUserGroup, HiCash, HiTrendingUp } from 'react-icons/hi'
import { PiUsersThreeBold } from "react-icons/pi";
import { GiChart, GiMoneyStack } from 'react-icons/gi'
import { useTranslations } from 'next-intl'

interface ReferralStatsProps {
  totalReferrals: number
  totalEarnings: number
  level1Earnings: number
  level2Earnings: number
  level3Earnings: number
}

export function ReferralStats({
  totalReferrals,
  totalEarnings,
  level1Earnings,
  level2Earnings,
  level3Earnings,
}: ReferralStatsProps) {
  const t = useTranslations('referrals')
  const stats = [
    {
      label: t('totalReferrals'),
      value: totalReferrals,
      icon: PiUsersThreeBold ,
      color: 'text-[#a78bfa]',
      bgColor: 'bg-[#8b5cf6]/20',
      borderColor: 'border-[#8b5cf6]/30',
    },
    {
      label: t('totalEarnings'),
      value: formatCurrency(totalEarnings),
      subValue: formatCurrencyUSD(totalEarnings),
      icon: GiMoneyStack,
      color: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/20',
      borderColor: 'border-[#10b981]/30',
    },
    {
      label: t('activeNetwork'),
      value: totalReferrals,
      icon: GiChart,
      color: 'text-[#a78bfa]',
      bgColor: 'bg-[#8b5cf6]/20',
      borderColor: 'border-[#8b5cf6]/30',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`theme-bg-secondary border ${stat.borderColor} rounded-xl p-3 sm:p-4`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm theme-text-secondary mb-1.5">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs theme-text-muted mt-0.5 truncate">{stat.subValue}</p>
                  )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Commission Breakdown */}
      <div className="theme-bg-secondary theme-border border rounded-xl p-4 sm:p-5">
        <h3 className="text-base font-semibold theme-text-primary mb-3 sm:mb-4">{t('commissionBreakdown', { defaultValue: 'Commission Breakdown' })}</h3>
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between p-2.5 sm:p-3 theme-bg-tertiary rounded-lg gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[#8b5cf6] font-bold text-xs sm:text-sm">1</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="theme-text-primary font-medium text-xs sm:text-sm truncate">{t('level1Label', { defaultValue: 'Level 1 (Direct)' })}</p>
                <p className="text-xs theme-text-muted">{t('commission10', { defaultValue: '10% commission' })}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="theme-text-primary font-semibold text-xs sm:text-sm whitespace-nowrap">{formatCurrency(level1Earnings)}</p>
              <p className="text-xs theme-text-muted whitespace-nowrap">{formatCurrencyUSD(level1Earnings)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 sm:p-3 theme-bg-tertiary rounded-lg gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[#8b5cf6] font-bold text-xs sm:text-sm">2</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="theme-text-primary font-medium text-xs sm:text-sm truncate">{t('level2Label', { defaultValue: 'Level 2' })}</p>
                <p className="text-xs theme-text-muted">{t('commission5', { defaultValue: '5% commission' })}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="theme-text-primary font-semibold text-xs sm:text-sm whitespace-nowrap">{formatCurrency(level2Earnings)}</p>
              <p className="text-xs theme-text-muted whitespace-nowrap">{formatCurrencyUSD(level2Earnings)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 sm:p-3 theme-bg-tertiary rounded-lg gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[#8b5cf6] font-bold text-xs sm:text-sm">3</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="theme-text-primary font-medium text-xs sm:text-sm truncate">{t('level3Label', { defaultValue: 'Level 3' })}</p>
                <p className="text-xs theme-text-muted">{t('commission2', { defaultValue: '2% commission' })}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="theme-text-primary font-semibold text-xs sm:text-sm whitespace-nowrap">{formatCurrency(level3Earnings)}</p>
              <p className="text-xs theme-text-muted whitespace-nowrap">{formatCurrencyUSD(level3Earnings)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

