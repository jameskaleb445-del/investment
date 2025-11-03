'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { ReferralCode } from '@/app/components/dashboard/ReferralCode'
import { ReferralStats } from '@/app/components/dashboard/ReferralStats'
import { ReferralTree } from '@/app/components/dashboard/ReferralTree'
import { ReferralsSkeleton } from '@/app/components/referrals/ReferralsSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { FaRegBell } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

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
    // Simulate API call
    const fetchReferralData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/referrals/tree')
        // const data = await response.json()
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 500))
        const mockData: ReferralData = {
          referralCode: '@helena02',
          totalReferrals: 12,
          totalEarnings: 180000, // XAF
          level1Earnings: 120000, // XAF
          level2Earnings: 45000, // XAF
          level3Earnings: 15000, // XAF
          levels: [
            {
              level: 1,
              users: [
                {
                  id: '1',
                  name: 'John Doe',
                  email: 'john@example.com',
                  referralCode: '@john01',
                  totalInvested: 300000,
                  totalDeposited: 200000,
                  joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: '2',
                  name: 'Jane Smith',
                  email: 'jane@example.com',
                  referralCode: '@jane01',
                  totalInvested: 150000,
                  totalDeposited: 100000,
                  joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: '3',
                  name: 'Mike Johnson',
                  email: 'mike@example.com',
                  referralCode: '@mike01',
                  totalInvested: 50000,
                  totalDeposited: 80000,
                  joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
            },
            {
              level: 2,
              users: [
                {
                  id: '4',
                  name: 'Sarah Williams',
                  email: 'sarah@example.com',
                  referralCode: '@sarah01',
                  totalInvested: 200000,
                  totalDeposited: 150000,
                  joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: '5',
                  name: 'David Brown',
                  email: 'david@example.com',
                  referralCode: '@david01',
                  totalInvested: 100000,
                  totalDeposited: 120000,
                  joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
            },
            {
              level: 3,
              users: [
                {
                  id: '6',
                  name: 'Emily Davis',
                  email: 'emily@example.com',
                  referralCode: '@emily01',
                  totalInvested: 80000,
                  totalDeposited: 60000,
                  joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
            },
          ],
        }
        
        setReferralData(mockData)
      } catch (error) {
        console.error('Error fetching referral data:', error)
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
      <div className="min-h-screen bg-[#1a1a1f]">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-[#2d2d35] bg-[#1a1a1f] backdrop-blur-sm">
          <div className="flex-1" /> {/* Spacer */}
          <h1 className="text-lg font-semibold text-white">{t('title')}</h1>
          <div className="flex-1 flex justify-end">
            <button className="text-white/80 hover:text-white transition-colors cursor-pointer relative">
              <FaRegBell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
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
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 px-1">{t('yourReferralNetwork')}</h2>
            <ReferralTree levels={referralData.levels} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

