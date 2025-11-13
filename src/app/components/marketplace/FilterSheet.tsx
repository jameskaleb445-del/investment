'use client'

import { useState } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { PROJECT_STATUS } from '@/app/constants/projects'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  onReset: () => void
}

export interface FilterOptions {
  status: string[]
  minRoi: number | null
  maxRoi: number | null
  minDuration: number | null
  maxDuration: number | null
  minGoal: number | null
  maxGoal: number | null
}

export function FilterSheet({ isOpen, onClose, filters, onApplyFilters, onReset }: FilterSheetProps) {
  const t = useTranslations('marketplace')
  const { theme } = useTheme()
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const statusOptions = [
    { value: PROJECT_STATUS.FUNDING, label: t('funding') },
    { value: PROJECT_STATUS.ACTIVE, label: t('active') },
    { value: PROJECT_STATUS.COMPLETED, label: t('completed') },
  ]

  const handleStatusToggle = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      status: [],
      minRoi: null,
      maxRoi: null,
      minDuration: null,
      maxDuration: null,
      minGoal: null,
      maxGoal: null,
    }
    setLocalFilters(resetFilters)
    onReset()
  }

  const activeFiltersCount = 
    localFilters.status.length +
    (localFilters.minRoi !== null ? 1 : 0) +
    (localFilters.maxRoi !== null ? 1 : 0) +
    (localFilters.minDuration !== null ? 1 : 0) +
    (localFilters.maxDuration !== null ? 1 : 0) +
    (localFilters.minGoal !== null ? 1 : 0) +
    (localFilters.maxGoal !== null ? 1 : 0)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('filter')}>
      <div className="px-5 py-6 space-y-6">
        {/* Active Filters Count */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between p-3 theme-bg-secondary theme-border border rounded-lg">
            <span className="text-sm theme-text-secondary">
              {t('filtersActive', { count: activeFiltersCount })}
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-[#10b981] hover:text-[#10b981]/80 transition-colors cursor-pointer"
            >
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-semibold theme-text-primary mb-3">{t('projectStatus')}</h3>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = localFilters.status.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer !text-white ${
                    isSelected
                      ? 'bg-[#8b5cf6] theme-text-primary border border-[#8b5cf6]'
                      : `bg-[#1f1f24] theme-text-secondary border border-[#2d2d35] hover:theme-border-secondary ${theme === 'dark' ? 'dark:hover:bg-[#25252a]' : 'light:hover:bg-[#f8fafc]'}  `
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ROI Range */}
        <div>
          <h3 className="text-sm font-semibold theme-text-primary mb-3">{t('roiRange')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('minRoi')}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={localFilters.minRoi !== null ? localFilters.minRoi : ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setLocalFilters(prev => ({ ...prev, minRoi: null }))
                  } else {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      // Clamp between 0 and 100
                      const clampedValue = Math.max(0, Math.min(100, numValue))
                      setLocalFilters(prev => ({ ...prev, minRoi: clampedValue }))
                    }
                  }
                }}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
              {localFilters.minRoi !== null && localFilters.minRoi < 0 && (
                <p className="text-xs text-red-400 mt-1">{t('roiCannotBeNegative', { defaultValue: 'Minimum ROI cannot be negative' })}</p>
              )}
              {localFilters.minRoi !== null && localFilters.minRoi > 100 && (
                <p className="text-xs text-red-400 mt-1">{t('roiCannotExceed100', { defaultValue: 'ROI cannot exceed 100%' })}</p>
              )}
            </div>
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('maxRoi')}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="100"
                value={localFilters.maxRoi !== null ? localFilters.maxRoi : ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setLocalFilters(prev => ({ ...prev, maxRoi: null }))
                  } else {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      // Clamp between 0 and 100
                      const clampedValue = Math.max(0, Math.min(100, numValue))
                      setLocalFilters(prev => ({ ...prev, maxRoi: clampedValue }))
                    }
                  }
                }}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
              {localFilters.maxRoi !== null && localFilters.maxRoi < 0 && (
                <p className="text-xs text-red-400 mt-1">{t('roiCannotBeNegative', { defaultValue: 'Maximum ROI cannot be negative' })}</p>
              )}
              {localFilters.maxRoi !== null && localFilters.maxRoi > 100 && (
                <p className="text-xs text-red-400 mt-1">{t('roiCannotExceed100', { defaultValue: 'ROI cannot exceed 100%' })}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-[#707079] mt-2">{t('roiBetween0And100', { defaultValue: 'ROI must be between 0% and 100%' })}</p>
        </div>

        {/* Duration Range */}
        <div>
          <h3 className="text-sm font-semibold theme-text-primary mb-3">{t('duration')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('minDuration', { defaultValue: 'Min' })}</label>
              <input
                type="number"
                placeholder="1"
                value={localFilters.minDuration || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  minDuration: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('maxDuration', { defaultValue: 'Max' })}</label>
              <input
                type="number"
                placeholder="365"
                value={localFilters.maxDuration || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  maxDuration: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Goal Amount Range */}
        <div>
          <h3 className="text-sm font-semibold theme-text-primary mb-3">{t('fundingGoal')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('minGoal', { defaultValue: 'Min' })}</label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.minGoal || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  minGoal: e.target.value ? parseFloat(e.target.value) : null
                }))}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs theme-text-secondary mb-1 block">{t('maxGoal', { defaultValue: 'Max' })}</label>
              <input
                type="number"
                placeholder="10,000,000"
                value={localFilters.maxGoal || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  maxGoal: e.target.value ? parseFloat(e.target.value) : null
                }))}
                className="w-full px-3 py-2 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-[#2d2d35] theme-text-secondary hover:theme-bg-tertiary"
          >
            {t('clearAll')}
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 !text-white bg-[#8b5cf6] hover:bg-[#7c3aed] theme-text-primary"
          >
            {t('applyFilters')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

