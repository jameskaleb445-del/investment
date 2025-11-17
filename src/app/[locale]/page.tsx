'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { Button } from '@/app/components/ui/button'
import { GiTakeMyMoney } from "react-icons/gi";
import { FaChartLine } from 'react-icons/fa'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { PortfolioHeader } from '@/app/components/dashboard/PortfolioHeader'
import { LiveCreditTicker } from '@/app/components/dashboard/LiveCreditTicker'
import { TransactionsList } from '@/app/components/transactions/TransactionsList'
import { DailyRewards } from '@/app/components/dashboard/DailyRewards'
import { HomeSkeleton } from '@/app/components/dashboard/HomeSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { HiTrendingUp } from 'react-icons/hi'
import { HiMiniArrowLongDown, HiMiniArrowLongUp } from 'react-icons/hi2'
import { FaRegBell } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { useWallet } from '@/app/hooks/useWallet'
import { useQuery } from '@tanstack/react-query'

export default function Home() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tMarketplace = useTranslations('marketplace')
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)

  // Use TanStack Query for wallet balance
  const { data: walletData, isLoading: walletLoading } = useWallet()
  
  // Fetch investments
  const { data: investmentsData, isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/investments?status=active&limit=5')
      if (!response.ok) {
        throw new Error('Failed to fetch investments')
      }
      const data = await response.json()
      return data.investments || []
    },
  })

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?limit=5')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      return data.transactions || []
    },
  })

  const loading = walletLoading || investmentsLoading || transactionsLoading
  const wallet = walletData
  const investments = investmentsData || []
  const transactions = transactionsData || []

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


  if (loading) {
    return (
      <AppLayout>
        <HomeSkeleton />
      </AppLayout>
    )
  }

  // Available balance is balance minus pending withdrawals only
  // invested_amount is a separate metric
  const availableBalance = wallet
    ? Number(wallet.balance || 0) - Number(wallet.pending_withdrawal || 0)
    : 0

  const totalBalance = wallet ? Number(wallet.balance || 0) : 0
  const totalInvested = wallet ? Number(wallet.invested_amount || 0) : 0
  const totalEarnings = wallet ? Number(wallet.total_earnings || 0) : 0

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
                    {isBalanceVisible ? formatCurrency(totalAssetValue) : '••••••'}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs theme-text-muted">
                    {t('available')}: {isBalanceVisible ? formatCurrency(availableBalance) : '•••'}
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

            <LiveCreditTicker />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-1">
              <div className="relative bg-gradient-to-br from-[#10b981]/12 via-[#10b981]/5 to-transparent border border-[#10b981]/25 rounded-xl p-4 hover:border-[#10b981]/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-medium theme-text-secondary uppercase tracking-wide">{t('lifetimeEarnings')}</h3>
                  <div className="w-9 h-9 absolute right-2 bottom-3 rounded-full bg-[#10b981]/15 flex items-center justify-center">
                    <GiTakeMyMoney className="w-4.5 h-4.5 text-[#10b981]" />
                  </div>
                </div>
                <p className="font-semibold text-[#0d9b6c] mb-1 text-[clamp(1.25rem,4vw,1.5rem)]">
                  {formatCurrency(totalEarnings)}
                </p>
                <p className="text-xs text-[#10b981]/70">
                  {formatCurrencyUSD(totalEarnings).replace(/\.\d{2}$/, '')}
                </p>
              </div>
              <div className="relative bg-gradient-to-br from-[#8b5cf6]/12 via-[#8b5cf6]/5 to-transparent border border-[#8b5cf6]/25 rounded-xl p-4 hover:border-[#8b5cf6]/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-medium theme-text-secondary uppercase tracking-wide">{t('activeInvestmentsCount')}</h3>
                  <div className="w-9 h-9 absolute right-2 bottom-3 rounded-full bg-[#8b5cf6]/15 flex items-center justify-center">
                    <FaChartLine className="w-4.5 h-4.5 text-[#8b5cf6]" />
                  </div>
                </div>
                <p className="font-semibold text-[#7c3aed] mb-1 text-[clamp(1.25rem,4vw,1.5rem)]">
                  {investments.length}
                </p>
                <p className="text-xs text-[#7c3aed]/70">
                  {t('activeInvestmentsDetail', { count: investments.length })}
                </p>
              </div>
              
            </div>

            {/* Daily Rewards */}
            <DailyRewards />

   {/* Performance Insights */}
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
                            {formatCurrency(inv.amount)}
                          </p>
                          <p className="text-xs theme-text-muted mb-0.5">
                            {formatCurrencyUSD(inv.amount)}
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
              <TransactionsList transactions={transactions} variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
