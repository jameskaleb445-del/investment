'use client'

import { useState } from 'react'
import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { formatRelativeTime, formatDateGroup } from '@/app/utils/date'
import { TransactionDetailsSheet } from './TransactionDetailsSheet'
import { HiTrendingUp } from 'react-icons/hi'
import { TfiGift } from "react-icons/tfi";
import { HiMiniArrowLongDown, HiMiniArrowLongUp } from 'react-icons/hi2'
import { 
  FaHandHoldingUsd,
  FaCoins,
  FaGift
} from 'react-icons/fa'
import { 
  MdAccountBalanceWallet,
  MdMoneyOff
} from 'react-icons/md'
import { useTranslations } from 'next-intl'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'commission' | 'refund'
  amount: string | number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  created_at: string
  metadata?: Record<string, any>
}

interface TransactionsListProps {
  transactions: Transaction[]
  filter?: string
  variant?: 'compact' | 'full' // 'compact' for homepage, 'full' for transaction history page
}

export function TransactionsList({ transactions, filter, variant = 'full' }: TransactionsListProps) {
  const t = useTranslations('transactions')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filter transactions based on selected filter
  const filteredTransactions = filter && filter !== 'all'
    ? transactions.filter(t => t.type === filter || t.status === filter)
    : transactions

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setTimeout(() => {
      setSelectedTransaction(null)
    }, 300)
  }
  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full theme-bg-tertiary flex items-center justify-center mb-4">
          <FaHandHoldingUsd className="w-8 h-8 theme-text-secondary" />
        </div>
        <h3 className="text-lg font-semibold theme-text-primary mb-2">{t('noTransactions')}</h3>
        <p className="text-sm theme-text-secondary text-center max-w-xs">
          {t('noTransactionsDescription')}
        </p>
      </div>
    )
  }

  const getTransactionIcon = (type: Transaction['type'], metadata?: Record<string, any>) => {
    // Check if it's a daily reward (gift icon)
    if (metadata?.isDailyReward || (type === 'deposit' && metadata?.reference?.startsWith('daily_reward_'))) {
      return <TfiGift className="w-5 h-5 text-[#8b5cf6]" />
    }

    switch (type) {
      case 'deposit':
        return <HiMiniArrowLongDown className="w-5 h-5 text-[#10b981]" />
      case 'withdrawal':
        return <HiMiniArrowLongUp className="w-5 h-5 text-red-400" />
      case 'investment':
        return <HiTrendingUp className="w-5 h-5 text-[#a78bfa]" />
      case 'return':
        return <FaCoins className="w-5 h-5 text-[#10b981]" />
      case 'commission':
        return <TfiGift className="w-5 h-5 text-[#10b981]" />
      case 'refund':
        return <MdMoneyOff className="w-5 h-5 text-[#a78bfa]" />
      default:
        return <MdAccountBalanceWallet className="w-5 h-5 text-[#6b7280]" />
    }
  }

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'return':
      case 'commission':
        return 'text-[#10b981]'
      case 'withdrawal':
        return 'text-red-400'
      case 'investment':
      case 'refund':
        return 'text-[#a78bfa]'
      default:
        return 'text-[#6b7280]'
    }
  }

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return t('deposit')
      case 'withdrawal':
        return t('withdrawal')
      case 'investment':
        return t('investment')
      case 'return':
        return t('return')
      case 'commission':
        return t('commission')
      case 'refund':
        return t('refund')
      default:
        return t('transaction', { defaultValue: 'Transaction' })
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const baseClasses = "px-2 py-0.5 rounded text-[10px] font-medium"
    switch (status) {
      case 'completed':
        return (
            <span className={`${baseClasses} bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30`}>
            {t('completed')}
          </span>
        )
      case 'pending':
        return (
          <span className={`${baseClasses} bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30`}>
            {t('pending')}
          </span>
        )
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
            {t('failed')}
          </span>
        )
      case 'cancelled':
        return (
          <span className={`${baseClasses} bg-[#707079]/20 text-[#a0a0a8] border border-[#707079]/30`}>
            {t('cancelled')}
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-[#707079]/20 text-[#a0a0a8] border border-[#707079]/30`}>
            {status}
          </span>
        )
    }
  }

  // Group transactions by date using moment
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = formatDateGroup(transaction.created_at)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {} as Record<string, Transaction[]>)

  // Style variables based on variant
  const containerClasses = variant === 'compact' 
    ? 'space-y-4' 
    : 'p-4 space-y-6 pb-6'
  
  const dateGroupClasses = variant === 'compact'
    ? 'space-y-2'
    : 'space-y-3'
  
  const dateLabelClasses = variant === 'compact'
    ? 'text-xs font-medium theme-text-muted uppercase tracking-wider px-1'
    : 'text-xs font-medium theme-text-muted uppercase tracking-wider px-2'
  
      const transactionCardClasses = variant === 'compact'
        ? 'bg-transparent border-b theme-border rounded-none py-3 first:pt-0 last:border-0 hover:theme-bg-tertiary/50 transition-all'
        : 'theme-bg-secondary theme-border border rounded-lg p-4 hover:theme-bg-tertiary hover:theme-border-secondary transition-all'
  
      const iconClasses = variant === 'compact'
        ? 'w-9 h-9 rounded-full theme-bg-tertiary flex items-center justify-center flex-shrink-0'
        : 'w-11 h-11 rounded-full theme-bg-tertiary flex items-center justify-center flex-shrink-0 border theme-border-secondary'
  
  const titleClasses = 'theme-text-primary font-medium text-sm leading-tight flex-1 min-w-0'
  
  const amountContainerClasses = variant === 'compact'
    ? 'flex flex-col items-end ml-2 flex-shrink-0 min-w-[100px]'
    : 'flex flex-col items-end ml-2 flex-shrink-0 min-w-[120px]'
  
  const getAmountClasses = (type: Transaction['type']) => variant === 'compact'
    ? `font-semibold text-sm ${getTransactionColor(type)} whitespace-nowrap`
    : `font-bold text-base ${getTransactionColor(type)} whitespace-nowrap`
  
  const xafAmountClasses = variant === 'compact'
    ? 'text-[10px] theme-text-muted mt-0.5 whitespace-nowrap'
    : 'text-xs theme-text-muted mt-0.5 whitespace-nowrap'
  
  const timeClasses = variant === 'compact'
    ? 'text-[11px] theme-text-muted'
    : 'text-xs theme-text-muted'
  
  const detailsSpacing = variant === 'compact'
    ? 'gap-2 mb-1'
    : 'gap-2 mb-1.5'

  return (
    <div className={containerClasses}>
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date} className={dateGroupClasses}>
          <h2 className={dateLabelClasses}>{date}</h2>
          
          <div className="space-y-2">
            {dateTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`${transactionCardClasses} cursor-pointer group relative`}
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={iconClasses}>
                    {getTransactionIcon(transaction.type, transaction.metadata)}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-start justify-between ${detailsSpacing}`}>
                      <h3 className={titleClasses}>
                        {transaction.description || getTransactionLabel(transaction.type)}
                      </h3>
                      <div className={amountContainerClasses}>
                        <div className={getAmountClasses(transaction.type)}>
                          {(transaction.type === 'deposit' || transaction.type === 'return' || transaction.type === 'commission') ? '+' : '-'}
                          {formatCurrency(Number(transaction.amount))}
                        </div>
                        <div className={xafAmountClasses}>
                          ≈{formatCurrencyUSD(Number(transaction.amount))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={timeClasses}>
                        {formatRelativeTime(transaction.created_at)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    
                 
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Transaction Details Sheet */}
      <TransactionDetailsSheet
        transaction={selectedTransaction}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  )
}

