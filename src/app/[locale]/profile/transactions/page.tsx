'use client'

import { useState } from 'react'
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

export default function TransactionsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Mock data for testing
  const transactions = [
    {
      id: '1',
      type: 'deposit' as const,
      amount: '50000',
      status: 'completed' as const,
      description: 'Deposit via Orange Money',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metadata: { method: 'orange_money' },
    },
    {
      id: '2',
      type: 'investment' as const,
      amount: '25000',
      status: 'completed' as const,
      description: 'Investment in Agriculture Project',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      metadata: { project_id: 'proj_1' },
    },
    {
      id: '3',
      type: 'return' as const,
      amount: '27500',
      status: 'completed' as const,
      description: 'Return from Real Estate Investment',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      metadata: { project_id: 'proj_2' },
    },
    {
      id: '4',
      type: 'commission' as const,
      amount: '5000',
      status: 'completed' as const,
      description: 'Referral Commission - Level 1',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      metadata: { referral_level: 1 },
    },
    {
      id: '5',
      type: 'withdrawal' as const,
      amount: '30000',
      status: 'pending' as const,
      description: 'Withdrawal to MTN Mobile Money',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      metadata: { method: 'mtn_mobile_money' },
    },
    {
      id: '6',
      type: 'deposit' as const,
      amount: '100000',
      status: 'completed' as const,
      description: 'Deposit via Bank Transfer',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      metadata: { method: 'bank_transfer' },
    },
    {
      id: '7',
      type: 'investment' as const,
      amount: '50000',
      status: 'completed' as const,
      description: 'Investment in Tech Startup',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      metadata: { project_id: 'proj_3' },
    },
    {
      id: '8',
      type: 'return' as const,
      amount: '55000',
      status: 'completed' as const,
      description: 'Return from Agriculture Project',
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      metadata: { project_id: 'proj_1' },
    },
    {
      id: '9',
      type: 'commission' as const,
      amount: '2500',
      status: 'completed' as const,
      description: 'Referral Commission - Level 2',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      metadata: { referral_level: 2 },
    },
    {
      id: '10',
      type: 'withdrawal' as const,
      amount: '20000',
      status: 'failed' as const,
      description: 'Withdrawal to Orange Money',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      metadata: { method: 'orange_money', reason: 'Insufficient balance' },
    },
  ]

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#1a1a1f]">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-[#2d2d35] bg-[#1a1a1f] backdrop-blur-sm">
          <Link
            href="/profile"
            className="text-[#9ca3af] hover:text-white transition-colors"
          >
            <AiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Transaction History</h1>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          >
            <FaSlidersH size={16}  />
          </button>
        </div>

        {/* Transactions List */}
        <div className="pt-20">
          <TransactionsList transactions={transactions} filter={filter} />
        </div>

        {/* Filter Bottom Sheet */}
        <BottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filter Transactions"
        >
          <div className="px-5 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Filter by Type</label>
              <Select value={filter} onValueChange={(value) => {
                setFilter(value)
                setIsFilterOpen(false)
              }}>
                <SelectTrigger className="w-full bg-[#1f1f24] border-[#2d2d35] text-white">
                  <SelectValue placeholder="Filter transactions" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f24] border-[#2d2d35]">
                  <SelectItem value="all" className="text-white hover:bg-[#2d2d35]">
                    All Transactions
                  </SelectItem>
                  <SelectItem value="deposit" className="text-white hover:bg-[#2d2d35]">
                    Deposits
                  </SelectItem>
                  <SelectItem value="withdrawal" className="text-white hover:bg-[#2d2d35]">
                    Withdrawals
                  </SelectItem>
                  <SelectItem value="investment" className="text-white hover:bg-[#2d2d35]">
                    Investments
                  </SelectItem>
                  <SelectItem value="return" className="text-white hover:bg-[#2d2d35]">
                    Returns
                  </SelectItem>
                  <SelectItem value="commission" className="text-white hover:bg-[#2d2d35]">
                    Commissions
                  </SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-[#2d2d35]">
                    Completed
                  </SelectItem>
                  <SelectItem value="pending" className="text-white hover:bg-[#2d2d35]">
                    Pending
                  </SelectItem>
                  <SelectItem value="failed" className="text-white hover:bg-[#2d2d35]">
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
