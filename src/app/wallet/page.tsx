'use client'

import { AppLayout } from '@/app/components/layout/AppLayout'
import { formatCurrencyUSD, formatCurrency } from '@/app/utils/format'
import { HiEye, HiEyeOff, HiBell, HiSearch, HiArrowDown, HiArrowUp } from 'react-icons/hi'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/ui/button'
import { TransactionsList } from '@/app/components/transactions/TransactionsList'
import { DepositBottomSheet } from '@/app/components/wallet/DepositBottomSheet'
import { WithdrawalBottomSheet } from '@/app/components/wallet/WithdrawalBottomSheet'
import { WalletSkeleton } from '@/app/components/wallet/WalletSkeleton'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'

export default function WalletPage() {
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
      // TODO: Replace with actual API call
      // const walletResponse = await fetch('/api/wallet/balance')
      // const transactionsResponse = await fetch('/api/transactions')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))

      // Mock data
      const mockWallet = {
        balance: 56890,
        invested_amount: 20321,
        pending_withdrawal: 0,
        total_earnings: 16988,
      }

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
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
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

  const totalAssetValue = wallet.balance + wallet.invested_amount
  const availableBalance = wallet.balance - wallet.pending_withdrawal
  const percentageChange = 23.0 // Mock percentage change

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#1a1a1f]">
      

        {/* App Bar - Sticky Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1f] px-4 py-3 flex items-center justify-between border-b border-[#2d2d35] backdrop-blur-sm">
          <span className="text-white font-semibold text-base">{t('title')}</span>
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
              <HiSearch className="w-6 h-6" />
            </button>
            <button className="text-white/80 hover:text-white transition-colors cursor-pointer relative">
              <HiBell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

            {/* Total Asset Value Section */}
            <div className="px-4 pt-20 pb-6 bg-[#1a1a1f]">
              <p className="text-sm text-[#a0a0a8] mb-4">{t('totalAssetValue')}</p>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">
              {isBalanceVisible ? formatCurrencyUSD(totalAssetValue) : '••••••'}
            </h1>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-[#a0a0a8] hover:text-white transition-colors cursor-pointer p-1"
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
            <p className="text-sm text-[#a0a0a8]">
              {formatCurrency(totalAssetValue)}
            </p>
          )}
        </div>

        {/* Quick Actions - Deposit & Withdrawal */}
        <div className="px-4 pb-4">
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
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
                <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-3">
                  <p className="text-xs text-[#a0a0a8] mb-1 uppercase tracking-wide">{t('available')}</p>
              <p className="text-lg font-bold text-white">
                {isBalanceVisible ? formatCurrencyUSD(availableBalance).replace(/\.\d{2}$/, '') : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] text-[#707079] mt-0.5">
                  {formatCurrency(availableBalance)}
                </p>
              )}
            </div>
                <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-3">
                  <p className="text-xs text-[#a0a0a8] mb-1 uppercase tracking-wide">{t('invested')}</p>
              <p className="text-lg font-bold text-[#a78bfa]">
                {isBalanceVisible ? formatCurrencyUSD(wallet.invested_amount).replace(/\.\d{2}$/, '') : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] text-[#707079] mt-0.5">
                  {formatCurrency(wallet.invested_amount)}
                </p>
              )}
            </div>
                <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-3">
                  <p className="text-xs text-[#a0a0a8] mb-1 uppercase tracking-wide">{t('earnings')}</p>
                  <p className="text-lg font-bold text-[#10b981]">
                {isBalanceVisible ? formatCurrencyUSD(wallet.total_earnings).replace(/\.\d{2}$/, '') : '•••'}
              </p>
              {isBalanceVisible && (
                <p className="text-[10px] text-[#707079] mt-0.5">
                  {formatCurrency(wallet.total_earnings)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 pb-6">
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">{t('recentTransactions')}</h2>
                </div>
            <TransactionsList transactions={transactions} variant="compact" />
          </div>
        </div>

        {/* Deposit Bottom Sheet */}
        <DepositBottomSheet
          isOpen={showDepositModal}
          onClose={handleDepositClose}
          onSuccess={() => {
            // TODO: Refresh wallet data
            console.log('Deposit successful')
          }}
        />

        {/* Withdrawal Bottom Sheet */}
        <WithdrawalBottomSheet
          isOpen={showWithdrawalModal}
          onClose={handleWithdrawalClose}
          availableBalance={availableBalance}
          onSuccess={() => {
            // TODO: Refresh wallet data
            console.log('Withdrawal successful')
          }}
        />
      </div>
    </AppLayout>
  )
}

