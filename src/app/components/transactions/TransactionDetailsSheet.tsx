'use client'

import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { formatDateTime } from '@/app/utils/date'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { 
  FaArrowDown, 
  FaArrowUp, 
  FaHandHoldingUsd,
  FaCoins,
  FaGift
} from 'react-icons/fa'
import { 
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdMoneyOff
} from 'react-icons/md'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'commission' | 'refund'
  amount: string | number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  created_at: string
  metadata?: Record<string, any>
}

interface TransactionDetailsSheetProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailsSheet({ transaction, isOpen, onClose }: TransactionDetailsSheetProps) {
  if (!transaction) return null

  const getTransactionIcon = (type: Transaction['type'], metadata?: Record<string, any>) => {
    // Check if it's a daily reward (gift icon)
    if (metadata?.isDailyReward || (type === 'deposit' && metadata?.reference?.startsWith('daily_reward_'))) {
      return <FaGift className="w-6 h-6 text-[#8b5cf6]" />
    }

    switch (type) {
      case 'deposit':
        return <FaArrowDown className="w-6 h-6 text-[#10b981]" />
      case 'withdrawal':
        return <FaArrowUp className="w-6 h-6 text-red-400" />
      case 'investment':
        return <MdTrendingUp className="w-6 h-6 text-[#a78bfa]" />
      case 'return':
        return <FaCoins className="w-6 h-6 text-[#10b981]" />
      case 'commission':
        return <FaGift className="w-6 h-6 text-[#10b981]" />
      case 'refund':
        return <MdMoneyOff className="w-6 h-6 text-[#a78bfa]" />
      default:
        return <MdAccountBalanceWallet className="w-6 h-6 text-[#6b7280]" />
    }
  }

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      case 'investment':
        return 'Investment'
      case 'return':
        return 'Return'
      case 'commission':
        return 'Commission'
      case 'refund':
        return 'Refund'
      default:
        return 'Transaction'
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
            Completed
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30">
            Pending
          </span>
        )
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            Failed
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#707079]/20 text-[#a0a0a8] border border-[#707079]/30">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#707079]/20 text-[#a0a0a8] border border-[#707079]/30">
            {status}
          </span>
        )
    }
  }

  const isPositive = transaction.type === 'deposit' || 
                     transaction.type === 'return' || 
                     transaction.type === 'commission'

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="px-5 py-6 space-y-6">
        {/* Transaction Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#2d2d35]">
          <div className="w-14 h-14 rounded-full bg-[#2d2d35] flex items-center justify-center border border-[#3a3a44]">
            {getTransactionIcon(transaction.type, transaction.metadata)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {transaction.description || getTransactionLabel(transaction.type)}
            </h3>
            <p className="text-sm text-[#a0a0a8]">
              {getTransactionLabel(transaction.type)}
            </p>
          </div>
          {getStatusBadge(transaction.status)}
        </div>

        {/* Amount Section */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#a0a0a8] mb-1 uppercase tracking-wide">Amount</p>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${isPositive ? 'text-[#10b981]' : 'text-red-400'}`}>
                {isPositive ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
              </p>
              <p className="text-sm text-[#707079]">
                ≈ {formatCurrencyUSD(Number(transaction.amount))}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="space-y-4 pt-4 border-t border-[#2d2d35]">
          <div className="flex justify-between items-start">
            <p className="text-sm text-[#a0a0a8]">Transaction ID</p>
            <p className="text-sm text-white font-mono">{transaction.id}</p>
          </div>
          
          <div className="flex justify-between items-start">
            <p className="text-sm text-[#a0a0a8]">Date & Time</p>
            <p className="text-sm text-white text-right">{formatDateTime(transaction.created_at)}</p>
          </div>

          <div className="flex justify-between items-start">
            <p className="text-sm text-[#a0a0a8]">Status</p>
            <div>
              {getStatusBadge(transaction.status)}
            </div>
          </div>

          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="pt-4 border-t border-[#2d2d35]">
              <p className="text-sm text-[#a0a0a8] mb-3">Additional Information</p>
              <div className="space-y-2">
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <p className="text-sm text-[#a0a0a8] capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-white text-right">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

