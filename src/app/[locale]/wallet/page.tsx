'use client'

import { AppLayout } from '@/app/components/layout/AppLayout'
import { formatCurrencyUSD, formatCurrency } from '@/app/utils/format'
import { HiEye, HiEyeOff, HiSearch, HiArrowDown, HiArrowUp } from 'react-icons/hi'
import { useState, useEffect, Suspense } from 'react'
import { NotificationsDropdown } from '@/app/components/notifications/NotificationsBottomSheet'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/ui/button'
import { TransactionsList } from '@/app/components/transactions/TransactionsList'
import { DepositBottomSheet } from '@/app/components/wallet/DepositBottomSheet'
import { WithdrawalBottomSheet } from '@/app/components/wallet/WithdrawalBottomSheet'
import { WalletSkeleton } from '@/app/components/wallet/WalletSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'

function WalletPageContent() {
  const t = useTranslations('wallet')
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [currentTime, setCurrentTime] = useState('9:41')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useTopLoadingBar(loading)

  useEffect(() => {
    fetchWalletData()
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      // Fetch wallet balance
      const walletResponse = await fetch('/api/wallet/balance')
      if (!walletResponse.ok) {
        throw new Error('Failed to fetch wallet balance')
      }
      const walletData = await walletResponse.json()

      // Fetch recent transactions (limit to 10 for wallet page)
      const transactionsResponse = await fetch('/api/transactions?limit=10')
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const transactionsData = await transactionsResponse.json()

      setWallet({
        balance: walletData.balance || 0,
        invested_amount: walletData.invested_amount || 0,
        pending_withdrawal: walletData.pending_withdrawal || 0,
        total_earnings: walletData.total_earnings || 0,
      })
      setTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      // Set empty data on error
      setWallet({
        balance: 0,
        invested_amount: 0,
        pending_withdrawal: 0,
        total_earnings: 0,
      })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Check URL params for action (deposit/withdraw)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'deposit') {
      setShowDepositModal(true)
      // Clean up URL
      router.replace('/wallet', { scroll: false })
    } else if (action === 'withdraw') {
      setShowWithdrawalModal(true)
      // Clean up URL
      router.replace('/wallet', { scroll: false })
    }
  }, [searchParams, router])

  const handleDepositClose = () => {
    setShowDepositModal(false)
    // Clean up URL if needed
    if (searchParams.get('action') === 'deposit') {
      router.replace('/wallet', { scroll: false })
    }
  }

  const handleWithdrawalClose = () => {
    setShowWithdrawalModal(false)
    // Clean up URL if needed
    if (searchParams.get('action') === 'withdraw') {
      router.replace('/wallet', { scroll: false })
    }
  }

  if (loading || !wallet) {
    return (
      <AppLayout>
        <WalletSkeleton />
      </AppLayout>
    )
  }

  const totalAssetValue = Number(wallet.balance) + Number(wallet.invested_amount)
  const availableBalance = Number(wallet.balance) - Number(wallet.pending_withdrawal)
  
  // Calculate percentage change based on total earnings
  // This is a simple calculation - you might want to track historical values
  const percentageChange = wallet.total_earnings > 0 && totalAssetValue > 0
    ? ((Number(wallet.total_earnings) / totalAssetValue) * 100)
    : 0

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
      

        {/* App Bar - Sticky Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 theme-border border-b theme-bg-primary backdrop-blur-sm">
          <div className="flex-1" /> {/* Spacer */}
          <h1 className="text-lg font-semibold theme-text-primary">{t('title')}</h1>
          <div className="flex-1 flex justify-end">
            <NotificationsDropdown />
          </div>
        </div>

            {/* Total Asset Value Section */}
            <div className="px-4 pt-20 pb-6 theme-bg-primary">
              <p className="text-sm theme-text-secondary mb-4">{t('totalAssetValue')}</p>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold theme-text-primary text-[clamp(1.75rem,6vw,3rem)]">
              {isBalanceVisible ? formatCurrency(totalAssetValue) : '••••••'}
            </h1>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer p-1"
            >
              {isBalanceVisible ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
              +{percentageChange.toFixed(2)}%
            </span>
          </div>
          {isBalanceVisible && (
            <p className="text-sm theme-text-secondary">
              {formatCurrencyUSD(totalAssetValue)}
            </p>
          )}
        </div>

        {/* Quick Actions - Deposit & Withdrawal */}
        <div className="px-4 pb-4">
          <div className="theme-bg-secondary theme-border border rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowDepositModal(true)}
                    className="w-full bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/30"
              >
                    <HiArrowDown className="w-5 h-5" />
                    {t('deposit')}
                  </Button>
                  <Button
                    onClick={() => setShowWithdrawalModal(true)}
                    className="w-full bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#a78bfa] border border-[#8b5cf6]/30"
                  >
                    <HiArrowUp className="w-5 h-5" />
                    {t('withdraw')}
                  </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
                <div className="theme-bg-secondary theme-border border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1 uppercase tracking-wide">{t('available')}</p>
              <p className="font-bold theme-text-primary text-[clamp(0.875rem,2.5vw,1.125rem)]">
                {isBalanceVisible ? formatCurrency(availableBalance) : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] theme-text-muted mt-0.5">
                  {formatCurrencyUSD(availableBalance).replace(/\.\d{2}$/, '')}
                </p>
              )}
            </div>
                <div className="theme-bg-secondary theme-border border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1 uppercase tracking-wide">{t('invested')}</p>
              <p className="font-bold whitespace-nowrap text-[#a78bfa] text-[clamp(0.875rem,2.5vw,1.125rem)]">
                {isBalanceVisible ? formatCurrency(wallet.invested_amount) : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] theme-text-muted mt-0.5">
                  {formatCurrencyUSD(wallet.invested_amount).replace(/\.\d{2}$/, '')}
                </p>
              )}
            </div>
                <div className="theme-bg-secondary theme-border border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1 uppercase tracking-wide">{t('earnings')}</p>
                  <p className="font-bold text-[#10b981] text-[clamp(0.875rem,2.5vw,1.125rem)]">
                {isBalanceVisible ? formatCurrency(wallet.total_earnings) : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] theme-text-muted mt-0.5">
                  {formatCurrencyUSD(wallet.total_earnings).replace(/\.\d{2}$/, '')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 pb-6">
          <div className="theme-bg-secondary theme-border border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold theme-text-primary">{t('recentTransactions')}</h2>
                </div>
            <TransactionsList transactions={transactions} variant="compact" />
          </div>
        </div>

        {/* Deposit Bottom Sheet */}
        <DepositBottomSheet
          isOpen={showDepositModal}
          onClose={handleDepositClose}
          onSuccess={() => {
            // Refresh wallet data after successful deposit
            fetchWalletData()
          }}
        />

        {/* Withdrawal Bottom Sheet */}
        <WithdrawalBottomSheet
          isOpen={showWithdrawalModal}
          onClose={handleWithdrawalClose}
          availableBalance={availableBalance}
          onSuccess={() => {
            // Refresh wallet data after successful withdrawal
            fetchWalletData()
          }}
        />
      </div>
    </AppLayout>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <WalletSkeleton />
      </AppLayout>
    }>
      <WalletPageContent />
    </Suspense>
  )
}

