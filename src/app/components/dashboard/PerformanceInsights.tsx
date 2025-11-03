'use client'

import { formatCurrencyUSD } from '@/app/utils/format'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

interface PerformanceInsightsProps {
  totalEarnings: number
  monthlyGrowth?: number
  activeProjects?: number
}

export function PerformanceInsights({ 
  totalEarnings, 
  monthlyGrowth = 12.5,
  activeProjects = 2 
}: PerformanceInsightsProps) {
  const t = useTranslations('home.performanceInsights')
  const isPositive = monthlyGrowth >= 0

  return (
    <div className="bg-gradient-to-br from-[#8b5cf6]/10 via-[#7c3aed]/5 to-transparent border border-[#8b5cf6]/20 rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">{t('title')}</h3>
          <p className="text-2xl font-bold text-white">{formatCurrencyUSD(totalEarnings)}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? ' text-[#10b981]' 
            : ' text-red-300'
        }`}>
          {isPositive ? (
            <HiTrendingUp className="w-3.5 h-3.5" />
          ) : (
            <HiTrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{Math.abs(monthlyGrowth)}%</span>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-3 border-t border-[#8b5cf6]/20">
        <div>
          <p className="text-xs text-[#a0a0a8] mb-0.5">{t('activeProjects')}</p>
          <p className="text-base font-semibold text-white">{activeProjects}</p>
        </div>
        <div className="w-px h-8 bg-[#2d2d35]"></div>
        <div>
          <p className="text-xs text-[#a0a0a8] mb-0.5">{t('roiAverage')}</p>
          <p className="text-base font-semibold text-[#10b981]">15.2%</p>
        </div>
      </div>
    </div>
  )
}

