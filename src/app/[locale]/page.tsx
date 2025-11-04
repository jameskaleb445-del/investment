'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { Button } from '@/app/components/ui/button'
import { GiMoneyStack, GiTakeMyMoney } from "react-icons/gi";
import { AppLayout } from '@/app/components/layout/AppLayout'
import { PortfolioHeader } from '@/app/components/dashboard/PortfolioHeader'
import { TransactionsList } from '@/app/components/transactions/TransactionsList'
import { EarningsChart } from '@/app/components/dashboard/EarningsChart'
import { PerformanceInsights } from '@/app/components/dashboard/PerformanceInsights'
import { DailyRewards } from '@/app/components/dashboard/DailyRewards'
import { HomeSkeleton } from '@/app/components/dashboard/HomeSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { HiCash, HiTrendingUp, HiChartBar, HiBell } from 'react-icons/hi'
import { FaRegBell } from 'react-icons/fa'
import { HiMiniArrowLongDown, HiMiniArrowLongUp } from 'react-icons/hi2'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tMarketplace = useTranslations('marketplace')
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<any>(null)
  const [investments, setInvestments] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)

  useTopLoadingBar(loading)

  // Handle scroll to show/hide sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // Show sticky header when scrolled past 200px (when portfolio header is out of view)
      setShowStickyHeader(scrollPosition > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const walletResponse = await fetch('/api/wallet/balance')
      // const investmentsResponse = await fetch('/api/investments')
      // const transactionsResponse = await fetch('/api/transactions')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock data
      const mockWallet = {
        balance: 150000,
        invested_amount: 85000,
        pending_withdrawal: 0,
        total_earnings: 25000,
      }

      const mockInvestments = [
        {
          id: '1',
          projects: { 
            name: t('investments.project1.name', { defaultValue: 'Agriculture Farm Equipment' }), 
            category: t('investments.project1.category', { defaultValue: 'Farm Equipment' }), 
            status: 'active' 
          },
          amount: 50000,
          status: 'active',
        },
        {
          id: '2',
          projects: { 
            name: t('investments.project2.name', { defaultValue: 'Water Purification System' }), 
            category: t('investments.project2.category', { defaultValue: 'Water Purification' }), 
            status: 'funding' 
          },
          amount: 35000,
          status: 'pending',
        },
      ]

      const mockTransactions = [
        {
          id: '1',
          type: 'deposit' as const,
          amount: 100000,
          status: 'completed' as const,
          description: 'MTN Mobile Money deposit',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'investment' as const,
          amount: 50000,
          status: 'completed' as const,
          description: 'Investment in Agriculture Farm Equipment',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          type: 'return' as const,
          amount: 7500,
          status: 'completed' as const,
          description: 'ROI from Water Purification System',
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '4',
          type: 'commission' as const,
          amount: 2500,
          status: 'completed' as const,
          description: 'Referral commission - Level 1',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: '5',
          type: 'withdrawal' as const,
          amount: 20000,
          status: 'pending' as const,
          description: 'Withdrawal to Orange Money',
          created_at: new Date(Date.now() - 345600000).toISOString(),
        },
      ]

      setWallet(mockWallet)
      setInvestments(mockInvestments)
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  // Mock data for now - Supabase will be connected later
  // AUTH DISABLED - Commented out temporarily
  // try {
  //   const supabase = await createClient()
  //   const {
  //     data: { user },
  //     error: authError,
  //   } = await supabase.auth.getUser()

  //   if (!authError && user) {
  //     // Get wallet balance
  //     const walletResult = await supabase
  //       .from('wallets')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .single()

  //     if (walletResult.data) {
  //       wallet = walletResult.data
  //     }

  //     // Get active investments
  //     const investmentsResult = await supabase
  //       .from('investments')
  //       .select('*, projects(name, category, status)')
  //       .eq('user_id', user.id)
  //       .in('status', ['pending', 'active'])
  //       .limit(5)

  //     if (investmentsResult.data) {
  //       investments = investmentsResult.data
  //     }
  //   }
  // } catch (error) {
  //   // Supabase not configured or error - use mock data
  // }

  if (loading) {
    return (
      <AppLayout>
        <HomeSkeleton />
      </AppLayout>
    )
  }

  const availableBalance = wallet
    ? Number(wallet.balance) -
      Number(wallet.invested_amount) -
      Number(wallet.pending_withdrawal)
    : 0

  const totalBalance = wallet ? Number(wallet.balance) : 0
  const totalInvested = wallet ? Number(wallet.invested_amount) : 0
  const totalEarnings = wallet ? Number(wallet.total_earnings) : 0

  // Mock earnings data for chart (last 7 days) - with variation for zigzag effect
  // Values in USD * 100 for better chart readability (so $200 = 20000)
  const earningsData = [
    { date: 'Mon', earnings: 2000 }, // $200 USD = 120000 XAF
    { date: 'Tue', earnings: 1092 }, // $292 USD = 175000 XAF
    { date: 'Wed', earnings: 2330 }, // $233 USD = 140000 XAF
    { date: 'Thu', earnings: 3250 }, // $325 USD = 195000 XAF
    { date: 'Fri', earnings: 275 }, // $275 USD = 165000 XAF
    { date: 'Sat', earnings: 367 }, // $367 USD = 220000 XAF
    { date: 'Today', earnings: Math.round(totalEarnings / 600) }, // Convert XAF to USD
  ]

  const totalAssetValue = totalBalance + totalInvested
  const calculatedPercentageChange = totalBalance > 0 
    ? parseFloat(((totalEarnings / totalBalance) * 100).toFixed(2))
    : 0

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        {/* Sticky Header - Appears on scroll */}
        <div 
          className={`fixed top-0 left-0 right-0 z-50 theme-bg-primary theme-border border-b backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out ${
            showStickyHeader 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Balance Info */}
              <div className={`flex items-center gap-3 flex-1 min-w-0 transition-all duration-500 ease-out ${
                showStickyHeader ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <div className="flex-shrink-0">
                  <p className="text-xs theme-text-secondary mb-0.5">{t('totalAssetValue')}</p>
                  <p className="text-lg font-bold theme-text-primary truncate">
                    {isBalanceVisible ? formatCurrencyUSD(totalAssetValue) : '••••••'}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs theme-text-muted">
                    {t('available')}: {isBalanceVisible ? formatCurrencyUSD(availableBalance).replace(/\.\d{2}$/, '') : '•••'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`flex items-center gap-4 transition-all duration-500 ease-out ${
                showStickyHeader ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}>
                <Link
                  href="/wallet?action=deposit"
                  className="theme-text-secondary border border-white/20 dark:border-white/20 light:border-black/20 rounded-full p-2 hover:theme-text-primary transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  title={t('quickActions.deposit')}
                >
                  <HiMiniArrowLongDown className="w-6 h-6" />
                </Link>
                <Link
                  href="/wallet?action=withdraw"
                  className="theme-text-secondary border border-white/20 dark:border-white/20 light:border-black/20 rounded-full p-2 hover:theme-text-primary transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  title={t('quickActions.withdraw')}
                >
                  <HiMiniArrowLongUp className="w-6 h-6" />
                </Link>
                <Link
                  href="/marketplace"
                  className="theme-text-secondary border border-white/20 dark:border-white/20 light:border-black/20 rounded-full p-2 hover:theme-text-primary transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  title={t('quickActions.invest')}
                >
                  <HiTrendingUp className="w-6 h-6" />
                </Link>
                <button className="theme-text-secondary hover:theme-text-primary transition-all duration-200 cursor-pointer relative hover:scale-110 active:scale-95">
                  <FaRegBell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          {/* Portfolio Header */}
          <PortfolioHeader
            totalBalance={totalBalance}
            totalInvested={totalInvested}
            totalEarnings={totalEarnings}
            percentageChange={calculatedPercentageChange}
          />

          {/* Dashboard Content */}
          <div className="px-4 pb-28 pt-4 space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-1">
              <div className="relative bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 hover:border-[#10b981]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 absolute top-1 right-1 flex items-center justify-center  transition-colors">
                    <GiMoneyStack  className="w-5 h-5 text-[#10b981]" />
                  </div>
                </div>
                <h3 className="text-xs font-medium theme-text-secondary mb-2 uppercase tracking-wide">{t('available')}</h3>
                <p className="text-2xl font-bold text-[#10b981] mb-1">
                  {formatCurrencyUSD(availableBalance).replace(/\.\d{2}$/, '')}
                </p>
                <p className="text-xs text-[#10b981]/70">
                  {formatCurrency(availableBalance)}
                </p>
              </div>
              <div className="relative bg-gradient-to-br from-[#8b5cf6]/10 to-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-xl p-4 hover:border-[#8b5cf6]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 absolute top-1 right-1 flex items-center justify-center transition-colors">
                    <HiTrendingUp className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                </div>
                <h3 className="text-xs font-medium theme-text-secondary mb-2 uppercase tracking-wide">{t('invested')}</h3>
                <p className="text-2xl font-bold text-[#a78bfa] mb-1">
                  {formatCurrencyUSD(totalInvested).replace(/\.\d{2}$/, '')}
                </p>
                <p className="text-xs text-[#a78bfa]/70">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="relative bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 hover:border-[#10b981]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 absolute top-1 right-1 flex items-center justify-center transition-colors">
                      <GiTakeMyMoney  className="w-5 h-5 text-[#10b981]" />
                    </div>
                </div>
                <h3 className="text-xs font-medium theme-text-secondary mb-2 uppercase tracking-wide">{t('earnings')}</h3>
                <p className="text-2xl font-bold text-[#10b981] mb-1">
                  {formatCurrencyUSD(totalEarnings).replace(/\.\d{2}$/, '')}
                </p>
                <p className="text-xs text-[#10b981]/70">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
            </div>

            {/* Daily Rewards */}
            <DailyRewards 
              dailyReward={1000}
              streak={3}
              canClaim={true}
            />

   {/* Performance Insights */}
   <PerformanceInsights 
              totalEarnings={totalEarnings}
              monthlyGrowth={12.5}
              activeProjects={investments.length}
            />

            {/* Earnings Chart */}
            <div className="theme-bg-secondary theme-border border rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-semibold theme-text-primary mb-1">{t('earningsOverview')}</h2>
                  <p className="text-xs theme-text-secondary">{t('last7Days')}</p>
                </div>
              </div>
              <EarningsChart data={earningsData} />
            </div>
            {/* Active Investments */}
            <div className="theme-bg-secondary theme-border border rounded-xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold theme-text-primary">{t('activeInvestments')}</h2>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm" className="cursor-pointer text-xs">
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
              {investments && investments.length > 0 ? (
                <div className="space-y-4">
                  {investments.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="border-b theme-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium theme-text-primary text-sm mb-1">
                            {inv.projects?.name || t('marketplace.allProjects')}
                          </p>
                          <p className="text-xs theme-text-secondary">
                            {inv.projects?.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold theme-text-primary text-sm mb-1">
                            {formatCurrencyUSD(inv.amount)}
                          </p>
                          <p className="text-xs theme-text-muted mb-0.5">
                            {formatCurrency(inv.amount)}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'active' 
                              ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' 
                              : 'bg-yellow-500/20 theme-text-primary border border-yellow-500/30'
                          }`}>
                            {inv.status === 'active' 
                              ? tMarketplace('active') 
                              : inv.status === 'pending' 
                              ? tMarketplace('funding')
                              : inv.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="theme-text-secondary text-center py-8 text-sm">
                  {t('noActiveInvestments')}
                </p>
              )}
            </div>

         

            {/* Recent Transactions */}
            <div className="theme-bg-secondary theme-border border rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold theme-text-primary">{t('recentTransactions')}</h2>
                <Link href="/profile/transactions">
                  <Button variant="outline" size="sm" className="cursor-pointer text-xs">
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
              <TransactionsList transactions={transactions.slice(0, 5)} variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
