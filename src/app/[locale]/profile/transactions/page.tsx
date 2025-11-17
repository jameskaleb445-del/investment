'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { TransactionsList } from '@/app/components/transactions/TransactionsList'
import { Link } from '@/i18n/navigation'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { HiFilter } from 'react-icons/hi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { FaSlidersH } from 'react-icons/fa'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { TransactionsSkeleton } from '@/app/components/transactions/TransactionsSkeleton'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'commission' | 'refund'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  created_at: string
  metadata?: Record<string, any>
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useTopLoadingBar(loading)

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      if (filter && filter !== 'all') {
        // Map filter to query params
        if (['deposit', 'withdrawal', 'investment', 'return', 'commission'].includes(filter)) {
          params.append('type', filter)
        } else if (['pending', 'completed', 'failed', 'cancelled'].includes(filter)) {
          params.append('status', filter)
        }
      }

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 theme-border border-b theme-bg-primary backdrop-blur-sm">
          <Link
            href="/profile"
            className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
          >
            <AiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold theme-text-primary">Transaction History</h1>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
          >
            <FaSlidersH size={16}  />
          </button>
        </div>

        {/* Transactions List */}
        <div className="pt-20">
          {loading ? (
            <TransactionsSkeleton />
          ) : (
            <TransactionsList transactions={transactions} filter={filter} />
          )}
        </div>

        {/* Filter Bottom Sheet */}
        <BottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filter Transactions"
        >
          <div className="px-5 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium theme-text-primary">Filter by Type</label>
              <Select value={filter} onValueChange={(value) => {
                setFilter(value)
                setIsFilterOpen(false)
              }}>
                <SelectTrigger className="w-full theme-bg-secondary theme-border theme-text-primary cursor-pointer">
                  <SelectValue placeholder="Filter transactions" />
                </SelectTrigger>
                <SelectContent className="theme-bg-secondary theme-border">
                  <SelectItem value="all" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    All Transactions
                  </SelectItem>
                  <SelectItem value="deposit" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Deposits
                  </SelectItem>
                  <SelectItem value="withdrawal" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Withdrawals
                  </SelectItem>
                  <SelectItem value="investment" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Investments
                  </SelectItem>
                  <SelectItem value="return" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Returns
                  </SelectItem>
                  <SelectItem value="commission" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Commissions
                  </SelectItem>
                  <SelectItem value="completed" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Completed
                  </SelectItem>
                  <SelectItem value="pending" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Pending
                  </SelectItem>
                  <SelectItem value="failed" className="theme-text-primary hover:theme-bg-tertiary cursor-pointer">
                    Failed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </BottomSheet>
      </div>
    </AppLayout>
  )
}
