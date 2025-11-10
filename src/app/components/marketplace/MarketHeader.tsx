'use client'

import { HiSearch, HiTrendingUp, HiCash, HiBell, HiFilter } from 'react-icons/hi'
import { useState } from 'react'
import { formatCurrencyUSD } from '@/app/utils/format'
import { FaRegBell, FaSlidersH } from 'react-icons/fa'
import { GiMoneyStack } from 'react-icons/gi'
import { GiTakeMyMoney } from 'react-icons/gi'
import { useTranslations } from 'next-intl'
// Removed LanguageSelector and ThemeToggle to keep them only on Home

interface MarketHeaderProps {
  onSearch?: (query: string) => void
  onFilterClick?: () => void
  totalInvested?: number
  totalExpected?: number
  activeFiltersCount?: number
}

export function MarketHeader({ onSearch, onFilterClick, totalInvested = 0, totalExpected = 0, activeFiltersCount = 0 }: MarketHeaderProps) {
  const t = useTranslations('marketplace')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 theme-bg-primary theme-border border-b backdrop-blur-sm" style={{ paddingTop: '5px' }}>
      {/* Header with title */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold theme-text-primary">{t('title')}</h1>
          <div className="flex items-center gap-3">
            {(totalInvested > 0 || totalExpected > 0) && (
              <>
                <div className="flex items-center gap-1.5 px-2 py-1 theme-bg-secondary rounded-md theme-border border">
                  <GiMoneyStack className="w-3.5 h-3.5 theme-text-secondary" />
                  <span className="text-[10px] font-medium theme-text-primary">{formatCurrencyUSD(totalInvested)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 theme-bg-secondary rounded-md theme-border border">
                  <GiTakeMyMoney className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[10px] font-medium text-[#10b981]">{formatCurrencyUSD(totalExpected)}</span>
                </div>
              </>
            )}
            <button className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer relative">
              <FaRegBell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar with Filter */}
      <div className="px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-secondary" />
            <input
              type="text"
              placeholder={t('searchProjects')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={onFilterClick}
            className="relative flex-shrink-0 w-12 h-12 theme-bg-secondary theme-border border rounded-lg flex items-center justify-center theme-text-secondary hover:theme-text-primary hover:border-[#8b5cf6]/50 transition-all cursor-pointer"
            title={t('filter')}
          >
            <FaSlidersH size={16} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#8b5cf6] text-white text-[10px] font-semibold rounded-full border-2 theme-bg-primary">
                {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

