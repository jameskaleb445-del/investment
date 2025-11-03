'use client'

import { formatCurrencyUSD, formatCurrency, formatPercentage } from '@/app/utils/format'
import { HiTrendingUp, HiTrendingDown, HiCalendar, HiCash, HiChartBar } from 'react-icons/hi'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/app/lib/utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import { RiCalendarTodoLine } from "react-icons/ri";
import { GiChart } from 'react-icons/gi'
import { GiMoneyStack } from 'react-icons/gi'
import { useTranslations } from 'next-intl'

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
  onInvest?: () => void
}

export function ProjectDetailsSheet({
  isOpen,
  onClose,
  project,
  onInvest,
}: ProjectDetailsSheetProps) {
  const t = useTranslations('marketplace')
  const fundingPercentage = (project.fundedAmount / project.goalAmount) * 100
  const roiDisplay = project.estimatedRoi > 0 ? `+${project.estimatedRoi.toFixed(2)}` : project.estimatedRoi.toFixed(2)
  const isPositiveRoi = project.estimatedRoi >= 0
  const remainingAmount = project.goalAmount - project.fundedAmount

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={project.name}>
      <div className="px-5 py-6 space-y-6">
        {/* Project Status and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#a0a0a8]">{project.category}</span>
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
            <h3 className="text-sm font-semibold text-white mb-2">{t('aboutProject', { defaultValue: 'About this Project' })}</h3>
            <p className="text-sm text-[#a0a0a8] leading-relaxed">{project.description}</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">{t('aboutProject', { defaultValue: 'About this Project' })}</h3>
            <p className="text-sm text-[#a0a0a8] leading-relaxed">
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
            <span className="text-sm font-semibold text-white">{t('fundingProgress', { defaultValue: 'Funding Progress' })}</span>
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
                stroke="#2d2d35"
                strokeWidth="3"
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
              <span className="text-xs font-semibold text-white">
                {Math.round(fundingPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiTakeMyMoney className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-[#a0a0a8]">{t('expectedRoi', { defaultValue: 'Expected ROI' })}</span>
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
            <p className="text-lg font-bold text-white">{formatPercentage(project.estimatedRoi)}</p>
          </div>
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <RiCalendarTodoLine className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-[#a0a0a8]">{t('durationLabel', { defaultValue: 'Duration' })}</span>
            </div>
            <p className="text-lg font-bold text-white">{project.durationDays} {t('days', { defaultValue: 'days' })}</p>
          </div>
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiChart className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-[#a0a0a8]">{t('status', { defaultValue: 'Status' })}</span>
            </div>
            <p className="text-lg font-bold text-white capitalize">{project.status === 'active' ? t('active') : project.status === 'funding' ? t('funding') : project.status}</p>
          </div>
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GiMoneyStack className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-[#a0a0a8]">{t('remaining', { defaultValue: 'Remaining' })}</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrencyUSD(remainingAmount)}</p>
          </div>
        </div>

        {/* Potential Returns Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">{t('potentialReturns', { defaultValue: 'Potential Returns' })}</h3>
          
          {/* Example Investment Amounts */}
          <div className="space-y-3">
            {[50000, 100000, 250000, 500000].map((amount) => {
              const potentialReturn = amount * (project.estimatedRoi / 100)
              const totalReturn = amount + potentialReturn
              
              return (
                <div
                  key={amount}
                  className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-[#a0a0a8] mb-1">{t('ifYouInvest', { defaultValue: 'If you invest' })}</p>
                      <p className="text-base font-semibold text-white">
                        {formatCurrencyUSD(amount)}
                      </p>
                      <p className="text-xs text-[#6b7280]">{formatCurrency(amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#a0a0a8] mb-1">{t('youCouldGet', { defaultValue: 'You could get' })}</p>
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
            <p className="text-xs text-[#a0a0a8] mb-2">{t('totalInvestmentGoal', { defaultValue: 'Total Investment Goal' })}</p>
            <p className="text-2xl font-bold text-white mb-1">{formatCurrencyUSD(project.goalAmount)}</p>
            <p className="text-sm text-[#6b7280]">{formatCurrency(project.goalAmount)}</p>
          </div>
        </div>

        {/* ROI Breakdown Info */}
        <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-white">{t('understandingRoi', { defaultValue: 'Understanding ROI' })}</h4>
            <HiOutlineQuestionMarkCircle className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="space-y-3">
            <div className="bg-[#1f1f24]/50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-[#a0a0a8]">
                <strong className="text-white">ROI</strong> ({t('roiDefinition', { defaultValue: 'Return on Investment' })}) {t('roiDescription', { defaultValue: 'is the profit percentage you earn.' })}
              </p>
              <div className="bg-[#2d2d35] rounded-md p-2.5 mt-2">
                <p className="text-xs text-[#a0a0a8] mb-1.5">{t('exampleWithRoi', { roi: formatPercentage(project.estimatedRoi), defaultValue: `Example with ${formatPercentage(project.estimatedRoi)} ROI:` })}</p>
                <div className="space-y-1 text-xs">
                  <p className="text-[#a0a0a8]">{t('invest', { defaultValue: 'Invest' })}: <span className="text-white font-semibold">100,000 XAF</span></p>
                  <p className="text-[#a0a0a8]">{t('profit', { defaultValue: 'Profit' })}: <span className="text-[#10b981] font-semibold">+{formatCurrency(100000 * project.estimatedRoi / 100)}</span></p>
                  <p className="text-[#a0a0a8]">{t('totalReturn', { defaultValue: 'Total Return' })}: <span className="text-white font-semibold">{formatCurrency(100000 + (100000 * project.estimatedRoi / 100))}</span></p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-[#a0a0a8]">
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
              onInvest()
              onClose()
            }}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold"
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

