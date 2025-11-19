'use client'

import React from 'react'
import { HiGift, HiFire, HiCheckCircle } from 'react-icons/hi'
import { formatCurrency } from '@/app/utils/format'
import { Button } from '@/app/components/ui/button'
import toast from 'react-hot-toast'
import { TfiGift } from 'react-icons/tfi'
import { useTranslations } from 'next-intl'
import { useDailyRewards, useClaimDailyReward } from '@/app/hooks/useDailyRewards'

interface DailyRewardsProps {
  dailyReward?: number
  streak?: number
  canClaim?: boolean
  lastClaimDate?: string
}

export function DailyRewards({
  dailyReward: initialDailyReward,
  streak: initialStreak,
  canClaim: initialCanClaim,
  lastClaimDate: initialLastClaimDate,
}: DailyRewardsProps) {
  const t = useTranslations('home.dailyRewards')
  const { data: rewardStatus, isLoading: loading } = useDailyRewards()
  const claimMutation = useClaimDailyReward()

  const dailyReward = rewardStatus?.dailyReward || initialDailyReward || 1000
  const streak = rewardStatus?.streak || initialStreak || 0
  const canClaim = rewardStatus?.canClaim ?? initialCanClaim ?? true
  const claimed = !canClaim || rewardStatus?.claimedToday || false
  const claimedDates = rewardStatus?.claimedDates || []

  const handleClaim = async () => {
    try {
      const data = await claimMutation.mutateAsync()
      
      toast.success(
        t('claimSuccess', { amount: formatCurrency(data.reward.amount) }),
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
    } catch (error: any) {
      console.error('Error claiming daily reward:', error)
      toast.error(error.message || 'Failed to claim daily reward', {
        duration: 4000,
        style: {
          background: '#1f1f24',
          color: '#fff',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      })
    }
  }

  const isClaiming = claimMutation.isPending

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1 // Convert to Mon-Sun (0-6)

  // Get Monday of current week
  const todayDate = new Date()
  const dayOfWeek = todayDate.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const mondayDate = new Date(todayDate)
  mondayDate.setDate(todayDate.getDate() - diffToMonday)
  mondayDate.setHours(0, 0, 0, 0)

  // Helper to check if a day was claimed
  const isDayClaimed = (dayIndex: number) => {
    // Create a new date for the specific day of the week
    const checkDate = new Date(mondayDate)
    checkDate.setDate(mondayDate.getDate() + dayIndex)
    checkDate.setHours(0, 0, 0, 0)
    
    // Get date string in YYYY-MM-DD format using local date (avoiding timezone issues)
    const year = checkDate.getFullYear()
    const month = String(checkDate.getMonth() + 1).padStart(2, '0')
    const day = String(checkDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // Only show as claimed if it's today or in the past
    const todayDateStr = new Date().toISOString().split('T')[0]
    const isPastOrToday = dateStr <= todayDateStr
    
    return isPastOrToday && claimedDates.includes(dateStr)
  }

  return (
    <div className="bg-gradient-to-br from-[#8b5cf6]/10 via-[#7c3aed]/5 to-transparent border border-[#8b5cf6]/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TfiGift className="w-5 h-5 text-[#8b5cf6]" />
          <h3 className="text-base font-semibold theme-text-primary">{t('title')}</h3>
        </div>
        {streak >= 1 && (
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
          <p className="text-xs theme-text-secondary mb-1">{t('todaysReward')}</p>
          <p className="text-xl font-bold theme-text-primary">
            {formatCurrency(dailyReward)}
          </p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={claimed || isClaiming}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] !text-white theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        <p className="text-xs theme-text-secondary mb-2">{t('thisWeek')}</p>
        <div className="flex items-center justify-between gap-1.5">
          {days.map((day, index) => {
            const isPast = index < todayIndex
            const isToday = index === todayIndex
            const isFuture = index > todayIndex
            const wasClaimed = isDayClaimed(index)

            return (
              <div
                key={day}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                  wasClaimed && (isPast || isToday)
                    ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'
                    : isToday && !claimed
                    ? 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 ring-2 ring-[#8b5cf6]/30'
                    : isToday && claimed
                    ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'
                    : 'theme-bg-secondary theme-border border opacity-50'
                }`}
              >
                <span className="text-[10px] font-medium theme-text-secondary">
                  {day}
                </span>
                {wasClaimed && (isPast || isToday) ? (
                  <HiCheckCircle className="w-4 h-4 text-[#8b5cf6]" />
                ) : isToday && claimed ? (
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

