'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { ReferralCode } from '@/app/components/dashboard/ReferralCode'
import { ReferralStats } from '@/app/components/dashboard/ReferralStats'
import { ReferralTree } from '@/app/components/dashboard/ReferralTree'
import { ReferralsSkeleton } from '@/app/components/referrals/ReferralsSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'
import { NotificationsDropdown } from '@/app/components/notifications/NotificationsBottomSheet'

// Mock data - replace with actual API calls
interface ReferralData {
  referralCode: string
  totalReferrals: number
  totalEarnings: number
  level1Earnings: number
  level2Earnings: number
  level3Earnings: number
  levels: Array<{
    level: number
    users: Array<{
      id: string
      name: string
      email: string
      referralCode: string
      totalInvested?: number
      totalDeposited?: number
      joinedAt: string
    }>
  }>
}

export default function ReferralsPage() {
  const t = useTranslations('referrals')
  const [loading, setLoading] = useState(true)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  
  useTopLoadingBar(loading)

  useEffect(() => {
    const fetchReferralData = async () => {
      setLoading(true)
      try {
        // Fetch referral earnings and stats
        const earningsResponse = await fetch('/api/referrals/earnings')
        if (!earningsResponse.ok) {
          throw new Error('Failed to fetch referral earnings')
        }
        const earningsData = await earningsResponse.json()

        // Fetch referral tree
        const treeResponse = await fetch('/api/referrals/tree')
        if (!treeResponse.ok) {
          throw new Error('Failed to fetch referral tree')
        }
        const treeData = await treeResponse.json()

        const referralData: ReferralData = {
          referralCode: earningsData.referral_code || '',
          totalReferrals: earningsData.totalReferrals || 0,
          totalEarnings: Number(earningsData.totalEarnings) || 0,
          level1Earnings: Number(earningsData.level1Earnings) || 0,
          level2Earnings: Number(earningsData.level2Earnings) || 0,
          level3Earnings: Number(earningsData.level3Earnings) || 0,
          levels: treeData.levels || [],
        }
        
        setReferralData(referralData)
      } catch (error) {
        console.error('Error fetching referral data:', error)
        // Set empty data on error
        setReferralData({
          referralCode: '',
          totalReferrals: 0,
          totalEarnings: 0,
          level1Earnings: 0,
          level2Earnings: 0,
          level3Earnings: 0,
          levels: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  if (loading || !referralData) {
    return (
      <AppLayout>
        <ReferralsSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 theme-border border-b theme-bg-primary backdrop-blur-sm">
          <div className="flex-1" /> {/* Spacer */}
          <h1 className="text-lg font-semibold theme-text-primary">{t('title')}</h1>
          <div className="flex-1 flex justify-end">
            <NotificationsDropdown />
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 pb-28 px-4 space-y-4 sm:space-y-6">
          {/* Referral Code Section */}
          <ReferralCode referralCode={referralData.referralCode} />

          {/* Referral Stats */}
          <ReferralStats
            totalReferrals={referralData.totalReferrals}
            totalEarnings={referralData.totalEarnings}
            level1Earnings={referralData.level1Earnings}
            level2Earnings={referralData.level2Earnings}
            level3Earnings={referralData.level3Earnings}
          />

          {/* Referral Tree */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold theme-text-primary mb-3 sm:mb-4 px-1">{t('yourReferralNetwork')}</h2>
            <ReferralTree levels={referralData.levels} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

