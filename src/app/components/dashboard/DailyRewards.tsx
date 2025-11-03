'use client'

import React from 'react'
import { HiGift, HiFire, HiCheckCircle } from 'react-icons/hi'
import { formatCurrency } from '@/app/utils/format'
import { Button } from '@/app/components/ui/button'
import toast from 'react-hot-toast'
import { TfiGift } from 'react-icons/tfi'
import { useTranslations } from 'next-intl'

interface DailyRewardsProps {
  dailyReward?: number
  streak?: number
  canClaim?: boolean
  lastClaimDate?: string
}

export function DailyRewards({
  dailyReward = 1000, // Default 1000 XAF
  streak = 3,
  canClaim = true,
  lastClaimDate,
}: DailyRewardsProps) {
  const t = useTranslations('home.dailyRewards')
  const [isClaiming, setIsClaiming] = React.useState(false)
  const [claimed, setClaimed] = React.useState(!canClaim)

  const handleClaim = async () => {
    setIsClaiming(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setClaimed(true)
    setIsClaiming(false)
    toast.success(
      t('claimSuccess', { amount: formatCurrency(dailyReward) }),
      {
        duration: 4000,
        style: {
          background: '#1f1f24',
          color: '#fff',
          border: '1px solid #8b5cf6',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      }
    )
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1 // Convert to Mon-Sun (0-6)

  return (
    <div className="bg-gradient-to-br from-[#8b5cf6]/10 via-[#7c3aed]/5 to-transparent border border-[#8b5cf6]/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TfiGift className="w-5 h-5 text-[#8b5cf6]" />
          <h3 className="text-base font-semibold text-white">{t('title')}</h3>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30">
            <HiFire className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-xs font-medium text-[#8b5cf6]">
              {t('streak', { count: streak })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[#a0a0a8] mb-1">{t('todaysReward')}</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(dailyReward)}
          </p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={claimed || isClaiming}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            t('claiming')
          ) : claimed ? (
            <>
              <HiCheckCircle className="w-4 h-4 mr-1.5" />
              {t('claimed')}
            </>
          ) : (
            t('claimNow')
          )}
        </Button>
      </div>

      {/* Weekly Progress */}
      <div className="pt-3 border-t border-[#8b5cf6]/20">
        <p className="text-xs text-[#a0a0a8] mb-2">{t('thisWeek')}</p>
        <div className="flex items-center justify-between gap-1.5">
          {days.map((day, index) => {
            const isPast = index < todayIndex
            const isToday = index === todayIndex
            const isFuture = index > todayIndex

            return (
              <div
                key={day}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                  isPast
                    ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'
                    : isToday && !claimed
                    ? 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 ring-2 ring-[#8b5cf6]/30'
                    : isToday && claimed
                    ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'
                    : 'bg-[#1f1f24] border border-[#2d2d35] opacity-50'
                }`}
              >
                <span className="text-[10px] font-medium text-[#a0a0a8]">
                  {day}
                </span>
                {isPast || (isToday && claimed) ? (
                  <HiCheckCircle className="w-4 h-4 text-[#8b5cf6]" />
                ) : isToday ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#8b5cf6]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#2d2d35]" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {claimed && (
        <div className="mt-3 pt-3 border-t border-[#8b5cf6]/20">
          <p className="text-xs text-[#8b5cf6] text-center">
            {t('comeBackTomorrow')}
          </p>
        </div>
      )}
    </div>
  )
}

