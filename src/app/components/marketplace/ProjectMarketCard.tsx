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
  dailyRoi?: number // Daily ROI percentage (e.g., 12.0 for 12%)
  maxEarningsMultiplier?: number // Earnings cap multiplier (default 2.0 = 2x)
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
  const roiDisplay = estimatedRoi > 0 ? `+${estimatedRoi.toFixed(2)}` : estimatedRoi.toFixed(2)
  const isPositiveRoi = estimatedRoi >= 0

  // Calculate potential return based on level data or project ROI
  const investmentAmount = customAmount ? parseFloat(customAmount.replace(/[^\d.]/g, '')) || 0 : 0
  let potentialReturn = 0
  let totalReturn = 0
  let dailyProfit = 0
  let daysToCap = 0
  
  if (investmentAmount > 0) {
    // Try to find matching level for custom amount
    const matchingLevel = levels.find(l => l.priceXaf === investmentAmount)
    const levelData = matchingLevel || activeLevel
    
    if (levelData?.dailyRoi && levelData?.maxEarningsMultiplier) {
      // Use level-based calculation
      dailyProfit = (investmentAmount * levelData.dailyRoi) / 100
      const maxProfit = investmentAmount * (levelData.maxEarningsMultiplier - 1)
      totalReturn = investmentAmount * levelData.maxEarningsMultiplier // Total at cap
      potentialReturn = maxProfit // Profit at cap
      daysToCap = dailyProfit > 0 ? maxProfit / dailyProfit : 0
    } else {
      // Fallback to project ROI (old calculation)
      potentialReturn = investmentAmount * (estimatedRoi / 100)
      totalReturn = investmentAmount + potentialReturn
    }
  }

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
      {/* ROI percentage at top right */}
      <div className="absolute top-4 right-4 z-10">
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
      </div>

      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex-1 min-w-0">
          <h3 className="theme-text-primary font-semibold text-base mb-1 truncate">{name}</h3>
          <p
            className="text-xs theme-text-secondary"
            style={{ color: isDark ? undefined : '#4c1d95' }}
          >
            {category}
          </p>
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
                {dailyProfit > 0 && daysToCap > 0 && (
                  <>
                    <div className="flex items-center justify-between pt-1 border-t border-[#10b981]/20">
                      <span className="text-xs text-[#10b981]">{t('dailyEarnings', { defaultValue: 'Daily earnings' })}</span>
                      <span className="text-xs font-medium text-[#10b981]">+{formatCurrency(dailyProfit)}/day</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#10b981]">{t('daysToCap', { defaultValue: 'Days to reach cap' })}</span>
                      <span className="text-xs font-medium text-[#10b981]">~{Math.ceil(daysToCap)} days</span>
                    </div>
                  </>
                )}
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
