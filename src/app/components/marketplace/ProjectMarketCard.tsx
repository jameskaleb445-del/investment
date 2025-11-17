'use client'

import { useState } from 'react'
import { formatCurrencyUSD, formatCurrency, formatPercentage } from '@/app/utils/format'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'

export interface ProjectLevel {
  id: string
  level: string
  priceXaf: number
  hourlyReturnXaf: number
  tag?: string
}

interface ProjectMarketCardProps {
  id: string
  name: string
  category: string
  fundedAmount: number
  goalAmount: number
  estimatedRoi: number
  status: string
  durationDays: number
  onClick?: () => void
  isUserInvestment?: boolean
  userInvestmentAmount?: number
  levels?: ProjectLevel[]
  activeLevel?: ProjectLevel | null
  onShowLevels?: () => void
}

export function ProjectMarketCard({
  id,
  name,
  category,
  fundedAmount,
  goalAmount,
  estimatedRoi,
  status,
  durationDays,
  onClick,
  isUserInvestment = false,
  userInvestmentAmount = 0,
  levels = [],
  activeLevel = null,
  onShowLevels,
}: ProjectMarketCardProps) {
  const t = useTranslations('marketplace')
  const [customAmount, setCustomAmount] = useState('')
  const [showRoiHelp, setShowRoiHelp] = useState(false)
  const fundingPercentage = (fundedAmount / goalAmount) * 100
  const roiDisplay = estimatedRoi > 0 ? `+${estimatedRoi.toFixed(2)}` : estimatedRoi.toFixed(2)
  const isPositiveRoi = estimatedRoi >= 0

  // Calculate potential return
  const investmentAmount = customAmount ? parseFloat(customAmount.replace(/[^\d.]/g, '')) || 0 : 0
  const potentialReturn = investmentAmount * (estimatedRoi / 100)
  const totalReturn = investmentAmount + potentialReturn

  let theme: 'light' | 'dark' = 'light'
  try {
    theme = useTheme().theme
  } catch {
    theme = 'light'
  }
  const isDark = theme === 'dark'

  return (
    <div
      className="theme-bg-secondary theme-border border rounded-lg p-4 hover:theme-bg-tertiary hover:theme-border-secondary transition-all w-full flex-shrink-0 relative shadow-md hover:shadow-lg light:shadow-sm light:hover:shadow-md"
      style={{
        background: isDark ? '#1f1f24' : '#ffffff',
        borderColor: isDark ? '#2d2d35' : '#e2e8f0',
        boxShadow: isDark
          ? '0 14px 30px -15px rgba(0,0,0,0.55)'
          : '0 12px 32px -18px rgba(139,92,246,0.35)',
      }}
    >
      {/* ROI percentage and circular progress at top right */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        {/* ROI percentage */}
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-semibold',
            isPositiveRoi ? 'text-[#10b981]' : 'text-red-400'
          )}
        >
          {isPositiveRoi ? (
            <HiTrendingUp className="w-3 h-3" />
          ) : (
            <HiTrendingDown className="w-3 h-3" />
          )}
          {roiDisplay}%
        </div>
        
        {/* Circular Progress Bar */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-300 dark:text-[#2d2d35]"
            />
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke={fundingPercentage >= 100 ? '#10b981' : '#8b5cf6'}
              strokeWidth="3"
              strokeDasharray={`${fundingPercentage}, 100`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          {/* Percentage text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-semibold theme-text-primary">
              {Math.round(fundingPercentage)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex-1 min-w-0">
          <h3 className="theme-text-primary font-semibold text-base mb-1 truncate">{name}</h3>
          <p
            className="text-xs theme-text-secondary mb-2"
            style={{ color: isDark ? undefined : '#4c1d95' }}
          >
            {category}
          </p>
          {status === 'active' ? (
            <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
              {t('active')}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
              {t('funding')}
            </span>
          )}
          {activeLevel && (
            <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#8b5cf6]/10 border border-[#8b5cf6]/25">
              <span className="text-[11px] font-semibold text-[#8b5cf6] uppercase tracking-wide">
                {t('selectedLevelLabel', { level: activeLevel.level, defaultValue: `Level ${activeLevel.level}` })}
              </span>
              <span className="text-[10px] theme-text-secondary">
                {formatCurrency(activeLevel.priceXaf)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Custom Investment Input - Only show for non-user investments */}
        {!isUserInvestment && levels.length === 0 && (
          <div className="space-y-2">
            <label
              className="text-xs theme-text-secondary"
              style={{ color: isDark ? undefined : '#475569' }}
            >
              {t('calculateYourReturns', { defaultValue: 'Calculate your returns' })}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('enterAmount', { defaultValue: 'Enter amount...' })}
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '')
                  setCustomAmount(value)
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="theme-bg-tertiary theme-border-secondary theme-text-primary text-sm placeholder:theme-text-muted pr-16"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-text-secondary"
                style={{ color: isDark ? undefined : '#64748b' }}
              >
                XAF
              </span>
            </div>
            {investmentAmount > 0 && (
              <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs theme-text-secondary"
                    style={{ color: isDark ? undefined : '#475569' }}
                  >
                    {t('youInvest', { defaultValue: 'You invest' })}
                  </span>


                  <span className="text-xs font-medium theme-text-primary">{formatCurrency(investmentAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs theme-text-secondary"
                    style={{ color: isDark ? undefined : '#475569' }}
                  >
                    {t('youCouldGet', { defaultValue: 'You could get' })}
                  </span>
                  <span className="text-sm font-semibold text-[#10b981]">{formatCurrency(totalReturn)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#10b981]/20">
                  <span className="text-xs text-[#10b981]">{t('profit', { defaultValue: 'Profit' })}</span>
                  <span className="text-xs font-medium text-[#10b981]">+{formatCurrency(potentialReturn)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Info */}
        <div
          className="flex items-center justify-between text-xs theme-text-secondary"
          style={{ color: isDark ? undefined : '#475569' }}
        >
          <div className="flex items-center gap-1.5">
            <span>ROI: {formatPercentage(estimatedRoi)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowRoiHelp(true)
              }}
              className="text-[#8b5cf6] hover:text-[#7c3aed] transition-colors cursor-pointer"
            >
              <HiOutlineQuestionMarkCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <span>{durationDays} {t('days', { defaultValue: 'days' })}</span>
        </div>

        {/* Investment Levels Button */}
        {levels.length > 0 && !isUserInvestment && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onShowLevels?.()
              }}
              className="flex items-center justify-between w-full px-3 py-2 theme-bg-tertiary theme-border border rounded-lg text-xs font-medium theme-text-primary hover:theme-bg-tertiary/80 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!onShowLevels}
            >
              <span>{t('viewInvestmentPlans', { defaultValue: 'View investment levels' })}</span>
              <span className="text-[#8b5cf6] text-xs">+</span>
            </button>
          </div>
        )}

        {/* Invest Button or Investment Info */}
        {isUserInvestment ? (
          <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs theme-text-secondary mb-1"
                  style={{ color: isDark ? undefined : '#475569' }}
                >
                  {t('yourInvestment', { defaultValue: 'Your Investment' })}
                </p>
                <p className="text-sm font-semibold theme-text-primary">{formatCurrency(userInvestmentAmount)}</p>
                <p
                  className="text-xs theme-text-secondary opacity-80"
                  style={{ color: isDark ? undefined : '#64748b' }}
                >
                  {formatCurrencyUSD(userInvestmentAmount)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xs theme-text-secondary mb-1"
                  style={{ color: isDark ? undefined : '#475569' }}
                >
                  {t('expectedReturn', { defaultValue: 'Expected Return' })}
                </p>
                <p className="text-sm font-semibold text-[#10b981]">{formatCurrency(userInvestmentAmount + (userInvestmentAmount * estimatedRoi / 100))}</p>
                <p className="text-xs text-[#10b981]/70">+{formatCurrency(userInvestmentAmount * estimatedRoi / 100)} {t('profit', { defaultValue: 'profit' })}</p>
              </div>
            </div>
          </div>
        ) : (
          levels.length === 0 && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold mt-2"
              size="sm"
            >
              {t('investNow', { defaultValue: 'Invest Now' })}
            </Button>
          )
        )}
      </div>

      {/* ROI Help Sheet */}
      <BottomSheet
        isOpen={showRoiHelp}
        onClose={() => setShowRoiHelp(false)}
        title={t('understandingRoi', { defaultValue: 'Understanding ROI' })}
      >
        <div className="px-5 py-6 space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold theme-text-primary mb-2">{t('whatIsRoi', { defaultValue: 'What is ROI?' })}</h3>
              <p
                className="text-sm theme-text-secondary leading-relaxed"
                style={{ color: isDark ? undefined : '#475569' }}
              >
                {t('roiStandsFor', { defaultValue: 'ROI stands for' })} <strong className="theme-text-primary">{t('roiDefinition', { defaultValue: 'Return on Investment' })}</strong>. {t('roiPercentageDescription', { defaultValue: "It's the percentage of profit you'll earn on your investment." })}
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold theme-text-primary">{t('example', { defaultValue: 'Example:' })}</h4>
              <p
                className="text-sm theme-text-secondary"
                style={{ color: isDark ? undefined : '#475569' }}
              >
                {t('ifYouInvestInProject', { amount: '100,000 XAF', roi: formatPercentage(estimatedRoi), defaultValue: `If you invest 100,000 XAF in a project with ${formatPercentage(estimatedRoi)} ROI:` })}
              </p>
              <ul
                className="space-y-1.5 text-sm theme-text-secondary ml-4"
                style={{ color: isDark ? undefined : '#475569' }}
              >
                <li className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] mt-0.5">•</span>
                  <span>{t('yourProfit', { defaultValue: 'Your profit' })}: <span className="theme-text-primary font-semibold">{formatCurrency(100000 * estimatedRoi / 100)}</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] mt-0.5">•</span>
                  <span>{t('totalYouGetBack', { defaultValue: 'Total you get back' })}: <span className="text-[#10b981] font-semibold">{formatCurrency(100000 + (100000 * estimatedRoi / 100))}</span></span>
                </li>
              </ul>
            </div>

            <div className="theme-bg-secondary theme-border border rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold theme-text-primary">{t('keyPoints', { defaultValue: 'Key Points:' })}</h4>
              <ul
                className="space-y-1.5 text-xs theme-text-secondary ml-4"
                style={{ color: isDark ? undefined : '#475569' }}
              >
                <li className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] mt-0.5">•</span>
                  <span>{t('roiCalculatedOnInvestment', { defaultValue: 'ROI is calculated on your investment amount' })}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] mt-0.5">•</span>
                  <span>{t('getBackOriginalPlusProfit', { defaultValue: 'You get back your original investment + the profit' })}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] mt-0.5">•</span>
                  <span>{t('returnsPaidAfterDays', { days: durationDays, defaultValue: `Returns are paid automatically after ${durationDays} days` })}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
