'use client'

import { useEffect, useState } from 'react'
import { formatCurrencyUSD, formatCurrency, formatPercentage } from '@/app/utils/format'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/app/lib/utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import { RiCalendarTodoLine } from "react-icons/ri";
import { GiChart } from 'react-icons/gi'
import { GiMoneyStack } from 'react-icons/gi'
import { useTranslations } from 'next-intl'
import { Input } from '@/app/components/ui/input'
import type { ProjectLevel } from './ProjectMarketCard'

interface ProjectDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  project: {
    id: string
    name: string
    category: string
    fundedAmount: number
    goalAmount: number
    estimatedRoi: number
    status: string
    durationDays: number
    description?: string
  }
  selectedLevel?: ProjectLevel | null
  onInvest?: (options?: { level?: ProjectLevel | null; amount?: number }) => void
}

export function ProjectDetailsSheet({
  isOpen,
  onClose,
  project,
  selectedLevel = null,
  onInvest,
}: ProjectDetailsSheetProps) {
  const t = useTranslations('marketplace')
  const fundingPercentage = (project.fundedAmount / project.goalAmount) * 100
  const roiDisplay = project.estimatedRoi > 0 ? `+${project.estimatedRoi.toFixed(2)}` : project.estimatedRoi.toFixed(2)
  const isPositiveRoi = project.estimatedRoi >= 0
  const remainingAmount = project.goalAmount - project.fundedAmount
  const [customAmount, setCustomAmount] = useState<string>(selectedLevel ? selectedLevel.priceXaf.toString() : '')

  useEffect(() => {
    if (isOpen) {
      setCustomAmount(selectedLevel ? selectedLevel.priceXaf.toString() : '')
    }
  }, [selectedLevel, isOpen])

  const parsedAmount = customAmount ? parseFloat(customAmount.replace(/[^\d.]/g, '')) || 0 : 0
  const investmentAmount = parsedAmount > 0 ? parsedAmount : selectedLevel ? selectedLevel.priceXaf : 0
  const potentialReturn = investmentAmount * (project.estimatedRoi / 100)
  const totalReturn = investmentAmount + potentialReturn

  if (selectedLevel) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={project.name}>
        <div className="px-5 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm theme-text-secondary">{project.category}</span>
              {project.status === 'active' ? (
                <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                  {t('active')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                  {t('funding')}
                </span>
              )}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              isPositiveRoi ? "text-[#10b981]" : "text-red-400"
            )}>
              {isPositiveRoi ? (
                <HiTrendingUp className="w-4 h-4" />
              ) : (
                <HiTrendingDown className="w-4 h-4" />
              )}
              {roiDisplay}%
            </div>
          </div>

          <div className="relative theme-bg-secondary theme-border border rounded-xl p-4 overflow-hidden">
            {selectedLevel.tag && (
              <span className="absolute top-2 left-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4d4f] text-white rounded-r">
                {selectedLevel.tag}
              </span>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide mb-1">
                  {t('levelLabel', { defaultValue: 'Level' })}
                </p>
                <h3 className="text-xl font-bold theme-text-primary">{selectedLevel.level}</h3>
                <div className="mt-3">
                  <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide mb-1">{t('priceLabel', { defaultValue: 'Price' })}</p>
                  <p className="text-base font-semibold theme-text-primary">{formatCurrency(selectedLevel.priceXaf)}</p>
                  <p className="text-xs theme-text-secondary">{formatCurrencyUSD(selectedLevel.priceXaf)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide mb-1">{t('hourlyReturnLabel', { defaultValue: 'Earnings per hour' })}</p>
                <p className="text-base font-semibold text-[#10b981]">{formatCurrency(selectedLevel.hourlyReturnXaf)}</p>
                <p className="text-xs text-[#10b981]/70">{formatCurrencyUSD(selectedLevel.hourlyReturnXaf)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs theme-text-secondary">{t('calculateYourReturns', { defaultValue: 'Calculate your returns' })}</label>
            <div className="relative">
              <Input
                type="text"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '')
                  setCustomAmount(value)
                }}
                className="theme-bg-tertiary theme-border-secondary theme-text-primary text-sm placeholder:theme-text-muted pr-16"
                placeholder={t('enterAmount', { defaultValue: 'Enter amount...' })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-text-muted">XAF</span>
            </div>
          </div>

          {investmentAmount > 0 && (
            <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs theme-text-secondary">{t('youInvest', { defaultValue: 'You invest' })}</span>
                <span className="text-sm font-semibold theme-text-primary">{formatCurrencyUSD(investmentAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs theme-text-secondary">{t('youCouldGet', { defaultValue: 'You could get' })}</span>
                <span className="text-sm font-semibold text-[#10b981]">{formatCurrencyUSD(totalReturn)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#10b981]/20">
                <span className="text-xs text-[#10b981]">{t('profit', { defaultValue: 'Profit' })}</span>
                <span className="text-xs font-medium text-[#10b981]">+{formatCurrencyUSD(potentialReturn)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="theme-bg-secondary theme-border border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <HiTrendingUp className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-xs theme-text-secondary">{t('expectedRoi', { defaultValue: 'Expected ROI' })}</span>
              </div>
              <p className="text-lg font-bold theme-text-primary">{formatPercentage(project.estimatedRoi)}</p>
            </div>
            <div className="theme-bg-secondary theme-border border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <RiCalendarTodoLine className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-xs theme-text-secondary">{t('durationLabel', { defaultValue: 'Duration' })}</span>
              </div>
              <p className="text-lg font-bold theme-text-primary">{project.durationDays} {t('days', { defaultValue: 'days' })}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs theme-text-secondary">
              <span>{t('funded', { defaultValue: 'Funded' })}: {formatCurrencyUSD(project.fundedAmount)}</span>
              <span>{t('goal', { defaultValue: 'Goal' })}: {formatCurrencyUSD(project.goalAmount)}</span>
            </div>
            <div className="h-2 w-full rounded-full theme-bg-tertiary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]"
                style={{ width: `${Math.min(100, fundingPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>{Math.round(fundingPercentage)}%</span>
              <span>{t('remaining', { defaultValue: 'Remaining' })}: {formatCurrencyUSD(remainingAmount)}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              onInvest?.({ level: selectedLevel, amount: investmentAmount })
              onClose()
            }}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] !text-white font-semibold"
            size="lg"
            disabled={project.status !== 'funding'}
          >
            {project.status === 'funding'
              ? t('investNow', { defaultValue: 'Invest Now' })
              : t('projectActiveMessage', { defaultValue: 'This project is now active and generating returns' })}
          </Button>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={project.name}>
      <div className="px-5 py-6 space-y-6">
        {/* Project Status and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm theme-text-secondary">{project.category}</span>
            {project.status === 'active' ? (
              <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                {t('active')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                {t('funding')}
              </span>
            )}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            isPositiveRoi ? "text-[#10b981]" : "text-red-400"
          )}>
            {isPositiveRoi ? (
              <HiTrendingUp className="w-4 h-4" />
            ) : (
              <HiTrendingDown className="w-4 h-4" />
            )}
            {roiDisplay}%
          </div>
        </div>

        {/* Description */}
        {project.description ? (
          <div>
            <h3 className="text-sm font-semibold theme-text-primary mb-2">{t('aboutProject', { defaultValue: 'About this Project' })}</h3>
            <p className="text-sm theme-text-secondary leading-relaxed">{project.description}</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold theme-text-primary mb-2">{t('aboutProject', { defaultValue: 'About this Project' })}</h3>
            <p className="text-sm theme-text-secondary leading-relaxed">
              {t('projectDescription', { 
                category: project.category.toLowerCase(),
                roi: formatPercentage(project.estimatedRoi),
                days: project.durationDays,
                status: project.status === 'active' ? t('active') : t('funding'),
                defaultValue: `This investment opportunity focuses on ${project.category.toLowerCase()}, offering investors a potential return of ${formatPercentage(project.estimatedRoi)} over ${project.durationDays} days. The project is currently in the ${project.status === 'active' ? 'active' : 'funding'} phase.`
              })}
            </p>
          </div>
        )}

        {/* Funding Progress */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <span className="text-sm font-semibold theme-text-primary">{t('fundingProgress', { defaultValue: 'Funding Progress' })}</span>
            <div className="flex items-center justify-between text-xs text-[#6b7280]">
              <span>{t('funded', { defaultValue: 'Funded' })}: {formatCurrencyUSD(project.fundedAmount)}</span>
              <span>{t('goal', { defaultValue: 'Goal' })}: {formatCurrencyUSD(project.goalAmount)}</span>
            </div>
          </div>
          
          {/* Circular Progress Bar */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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
              <span className="text-xs font-semibold theme-text-primary">
                {Math.round(fundingPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="theme-bg-secondary theme-border border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiTakeMyMoney className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs theme-text-secondary">{t('expectedRoi', { defaultValue: 'Expected ROI' })}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Show ROI explanation in a tooltip or expand section
                  alert(`ROI (Return on Investment) means you'll earn ${formatPercentage(project.estimatedRoi)} profit on your investment.\n\nExample: If you invest 100,000 XAF, you'll get back ${formatCurrency(100000 + (100000 * project.estimatedRoi / 100))} (your 100,000 + ${formatCurrency(100000 * project.estimatedRoi / 100)} profit).`)
                }}
                className="text-[#8b5cf6] hover:text-[#7c3aed] transition-colors cursor-pointer"
              >
                <HiOutlineQuestionMarkCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-lg font-bold theme-text-primary">{formatPercentage(project.estimatedRoi)}</p>
          </div>
          <div className="theme-bg-secondary theme-border border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <RiCalendarTodoLine className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs theme-text-secondary">{t('durationLabel', { defaultValue: 'Duration' })}</span>
            </div>
            <p className="text-lg font-bold theme-text-primary">{project.durationDays} {t('days', { defaultValue: 'days' })}</p>
          </div>
          <div className="theme-bg-secondary theme-border border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiChart className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs theme-text-secondary">{t('status', { defaultValue: 'Status' })}</span>
            </div>
            <p className="text-lg font-bold theme-text-primary capitalize">{project.status === 'active' ? t('active') : project.status === 'funding' ? t('funding') : project.status}</p>
          </div>
          <div className="theme-bg-secondary theme-border border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiMoneyStack className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs theme-text-secondary">{t('remaining', { defaultValue: 'Remaining' })}</span>
            </div>
            <p className="text-lg font-bold theme-text-primary">{formatCurrencyUSD(remainingAmount)}</p>
          </div>
        </div>

        {/* Potential Returns Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold theme-text-primary">{t('potentialReturns', { defaultValue: 'Potential Returns' })}</h3>
          
          {/* Example Investment Amounts */}
          <div className="space-y-3">
            {[50000, 100000, 250000, 500000].map((amount) => {
              const potentialReturn = amount * (project.estimatedRoi / 100)
              const totalReturn = amount + potentialReturn
              
              return (
                <div
                  key={amount}
                  className="theme-bg-secondary theme-border border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs theme-text-secondary mb-1">{t('ifYouInvest', { defaultValue: 'If you invest' })}</p>
                      <p className="text-base font-semibold theme-text-primary">
                        {formatCurrencyUSD(amount)}
                      </p>
                      <p className="text-xs text-[#6b7280]">{formatCurrency(amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs theme-text-secondary mb-1">{t('youCouldGet', { defaultValue: 'You could get' })}</p>
                      <p className="text-base font-semibold text-[#10b981]">
                        {formatCurrencyUSD(totalReturn)}
                      </p>
                      <p className="text-xs text-[#10b981]/70">+{formatCurrencyUSD(potentialReturn)} {t('profit', { defaultValue: 'profit' })}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#2d2d35]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6b7280]">ROI: {formatPercentage(project.estimatedRoi)}</span>
                      <span className="text-[#6b7280]">{t('durationLabel', { defaultValue: 'Duration' })}: {project.durationDays} {t('days', { defaultValue: 'days' })}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total Investment Needed */}
          <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-4">
            <p className="text-xs theme-text-secondary mb-2">{t('totalInvestmentGoal', { defaultValue: 'Total Investment Goal' })}</p>
            <p className="text-2xl font-bold theme-text-primary mb-1">{formatCurrencyUSD(project.goalAmount)}</p>
            <p className="text-sm text-[#6b7280]">{formatCurrency(project.goalAmount)}</p>
          </div>
        </div>

        {/* ROI Breakdown Info */}
        <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold theme-text-primary">{t('understandingRoi', { defaultValue: 'Understanding ROI' })}</h4>
            <HiOutlineQuestionMarkCircle className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="space-y-3">
            <div className="bg-[#1f1f24]/50 rounded-lg p-3 space-y-2">
              <p className="text-xs theme-text-secondary">
                <strong className="theme-text-primary">ROI</strong> ({t('roiDefinition', { defaultValue: 'Return on Investment' })}) {t('roiDescription', { defaultValue: 'is the profit percentage you earn.' })}
              </p>
              <div className="theme-bg-tertiary rounded-md p-2.5 mt-2">
                <p className="text-xs theme-text-secondary mb-1.5">{t('exampleWithRoi', { roi: formatPercentage(project.estimatedRoi), defaultValue: `Example with ${formatPercentage(project.estimatedRoi)} ROI:` })}</p>
                <div className="space-y-1 text-xs">
                  <p className="theme-text-secondary">{t('invest', { defaultValue: 'Invest' })}: <span className="theme-text-primary font-semibold">100,000 XAF</span></p>
                  <p className="theme-text-secondary">{t('profit', { defaultValue: 'Profit' })}: <span className="text-[#10b981] font-semibold">+{formatCurrency(100000 * project.estimatedRoi / 100)}</span></p>
                  <p className="theme-text-secondary">{t('totalReturn', { defaultValue: 'Total Return' })}: <span className="theme-text-primary font-semibold">{formatCurrency(100000 + (100000 * project.estimatedRoi / 100))}</span></p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs theme-text-secondary">
              <p className="flex items-start gap-2">
                <span className="text-[#8b5cf6] mt-0.5">•</span>
                <span>{t('earnRoiOverDays', { roi: formatPercentage(project.estimatedRoi), days: project.durationDays, defaultValue: `Earn ${formatPercentage(project.estimatedRoi)} profit over ${project.durationDays} days` })}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#8b5cf6] mt-0.5">•</span>
                <span>{t('returnsPaidAutomatically', { defaultValue: 'Returns are calculated and paid automatically at project completion' })}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#8b5cf6] mt-0.5">•</span>
                <span>{t('investmentReturnedToWallet', { defaultValue: 'Your investment + profit will be returned to your wallet' })}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {project.status === 'funding' && onInvest && (
          <Button
            onClick={() => {
              onInvest({ level: null })
              onClose()
            }}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] theme-text-primary font-semibold"
            size="lg"
          >
            {t('investNow', { defaultValue: 'Invest Now' })}
          </Button>
        )}
        {project.status === 'active' && (
          <div className="bg-[#10b981]/20 border border-[#10b981]/30 rounded-lg p-3">
            <p className="text-sm text-[#10b981] text-center font-medium">
              {t('projectActiveMessage', { defaultValue: 'This project is now active and generating returns' })}
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

