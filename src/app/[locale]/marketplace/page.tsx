'use client'

import { useState, useEffect, Suspense } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { MarketHeader } from '@/app/components/marketplace/MarketHeader'
import { CategoryFilters } from '@/app/components/marketplace/CategoryFilters'
import { ProjectMarketCard } from '@/app/components/marketplace/ProjectMarketCard'
import { ProjectDetailsSheet } from '@/app/components/marketplace/ProjectDetailsSheet'
import { ProjectSkeleton } from '@/app/components/marketplace/ProjectSkeleton'
import { FilterSheet, FilterOptions } from '@/app/components/marketplace/FilterSheet'
import { PROJECT_STATUS } from '@/app/constants/projects'
import { HiSortAscending } from 'react-icons/hi'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import nprogress from 'nprogress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { useTranslations } from 'next-intl'
import type { ProjectLevel } from '@/app/components/marketplace/ProjectMarketCard'
import { formatCurrency, formatCurrencyUSD, formatPercentage } from '@/app/utils/format'
import { cn } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/button'

const PROJECT_LEVEL_OPTIONS: Record<string, ProjectLevel[]> = {
  '1': [
    { id: '1-lv1', level: 'LV1', priceXaf: 300000, hourlyReturnXaf: 10500, tag: 'New' },
    { id: '1-lv2', level: 'LV2', priceXaf: 600000, hourlyReturnXaf: 23500 },
    { id: '1-lv3', level: 'LV3', priceXaf: 1200000, hourlyReturnXaf: 52000 },
  ],
  '3': [
    { id: '3-lv1', level: 'LV1', priceXaf: 500000, hourlyReturnXaf: 12500, tag: 'New' },
    { id: '3-lv2', level: 'LV2', priceXaf: 1000000, hourlyReturnXaf: 27000 },
    { id: '3-lv3', level: 'LV3', priceXaf: 2000000, hourlyReturnXaf: 62000 },
  ],
  '7': [
    { id: '7-lv1', level: 'LV1', priceXaf: 1000000, hourlyReturnXaf: 41670, tag: 'New' },
    { id: '7-lv2', level: 'LV2', priceXaf: 2000000, hourlyReturnXaf: 95000 },
    { id: '7-lv3', level: 'LV3', priceXaf: 3500000, hourlyReturnXaf: 165000 },
  ],
  '8': [
    { id: '8-lv1', level: 'LV1', priceXaf: 750000, hourlyReturnXaf: 30500, tag: 'New' },
    { id: '8-lv2', level: 'LV2', priceXaf: 1500000, hourlyReturnXaf: 72000 },
    { id: '8-lv3', level: 'LV3', priceXaf: 2500000, hourlyReturnXaf: 138000 },
  ],
}

function MarketplacePageContent() {
  const t = useTranslations('marketplace')
  const [projects, setProjects] = useState<any[]>([])
  const [userInvestments, setUserInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState<ProjectLevel | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [levelsSheetProject, setLevelsSheetProject] = useState<{
    project: any
    levels: ProjectLevel[]
    activeLevel: ProjectLevel | null
  } | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    minRoi: null,
    maxRoi: null,
    minDuration: null,
    maxDuration: null,
    minGoal: null,
    maxGoal: null,
  })

  // Calculate total invested and expected returns
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpected = userInvestments.reduce((sum, inv) => {
    const expectedReturn = inv.amount + (inv.amount * inv.project.estimated_roi / 100)
    return sum + expectedReturn
  }, 0)

  // Calculate active filters count
  const activeFiltersCount = 
    filters.status.length +
    (filters.minRoi !== null ? 1 : 0) +
    (filters.maxRoi !== null ? 1 : 0) +
    (filters.minDuration !== null ? 1 : 0) +
    (filters.maxDuration !== null ? 1 : 0) +
    (filters.minGoal !== null ? 1 : 0) +
    (filters.maxGoal !== null ? 1 : 0)

  // Use top loading bar
  useTopLoadingBar(loading)

  useEffect(() => {
    // Trigger loading when filters change
    fetchProjects()
    fetchUserInvestments()
  }, [selectedCategory, sortBy, searchQuery, filters])
  
  // Initial load
  useEffect(() => {
    fetchProjects()
    fetchUserInvestments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/projects?category=${selectedCategory}&sort=${sortBy}`)
      // const data = await response.json()
      
      // Mock data for now - increased delay to see loading bar
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockProjects = [
        {
          id: '1',
          name: 'Agriculture Farm Equipment',
          category: 'Farm Equipment',
          funded_amount: 2500000,
          goal_amount: 5000000,
          estimated_roi: 15.5,
          status: PROJECT_STATUS.FUNDING,
          duration_days: 14,
        },
        {
          id: '7',
          name: 'Solar Power Installation',
          category: 'Energy',
          funded_amount: 12000000,
          goal_amount: 12000000,
          estimated_roi: 22.5,
          status: PROJECT_STATUS.ACTIVE,
          duration_days: 14,
        },
        {
          id: '2',
          name: 'Water Purification System',
          category: 'Water Purification',
          funded_amount: 4500000,
          goal_amount: 6000000,
          estimated_roi: 18.2,
          status: PROJECT_STATUS.FUNDING,
          duration_days: 21,
        },
        {
          id: '3',
          name: 'Delivery Van Fleet',
          category: 'Logistics Vehicles',
          funded_amount: 8000000,
          goal_amount: 8000000,
          estimated_roi: 12.8,
          status: PROJECT_STATUS.ACTIVE,
          duration_days: 7,
        },
        {
          id: '4',
          name: 'Retail Kiosk Setup',
          category: 'Retail Micro-Kits',
          funded_amount: 1200000,
          goal_amount: 3000000,
          estimated_roi: 20.5,
          status: PROJECT_STATUS.FUNDING,
          duration_days: 10,
        },
        {
          id: '5',
          name: 'Event Chairs & Tables',
          category: 'Event Furniture',
          funded_amount: 3200000,
          goal_amount: 4000000,
          estimated_roi: 16.3,
          status: PROJECT_STATUS.FUNDING,
          duration_days: 5,
        },
        {
          id: '6',
          name: 'Smartphone Leasing',
          category: 'Device Leasing',
          funded_amount: 5500000,
          goal_amount: 7000000,
          estimated_roi: 14.7,
          status: PROJECT_STATUS.FUNDING,
          duration_days: 14,
        },
      ]
      
      let filtered = [...mockProjects]
      
      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category === selectedCategory)
      }
      
      // Filter by search
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Filter by status
      if (filters.status.length > 0) {
        filtered = filtered.filter(p => filters.status.includes(p.status))
      }
      
      // Filter by ROI range
      if (filters.minRoi !== null) {
        filtered = filtered.filter(p => p.estimated_roi >= filters.minRoi!)
      }
      if (filters.maxRoi !== null) {
        filtered = filtered.filter(p => p.estimated_roi <= filters.maxRoi!)
      }
      
      // Filter by duration range
      if (filters.minDuration !== null) {
        filtered = filtered.filter(p => p.duration_days >= filters.minDuration!)
      }
      if (filters.maxDuration !== null) {
        filtered = filtered.filter(p => p.duration_days <= filters.maxDuration!)
      }
      
      // Filter by goal amount range
      if (filters.minGoal !== null) {
        filtered = filtered.filter(p => p.goal_amount >= filters.minGoal!)
      }
      if (filters.maxGoal !== null) {
        filtered = filtered.filter(p => p.goal_amount <= filters.maxGoal!)
      }
      
      // Sort
      if (sortBy === 'roi') {
        filtered.sort((a, b) => b.estimated_roi - a.estimated_roi)
      } else if (sortBy === 'progress') {
        filtered.sort((a, b) => {
          const progressA = (a.funded_amount / a.goal_amount) * 100
          const progressB = (b.funded_amount / b.goal_amount) * 100
          return progressB - progressA
        })
      } else {
        filtered.reverse() // newest first
      }
      
      setProjects(filtered)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

          const fetchUserInvestments = async () => {
            try {
              // TODO: Replace with actual API call
              // const response = await fetch('/api/investments/my-investments')
              // const data = await response.json()
              
              // Mock data for user's active investments
              await new Promise(resolve => setTimeout(resolve, 200))
              const mockUserInvestments = [
                {
                  id: 'inv-1',
                  project_id: '3',
                  project: {
                    id: '3',
                    name: 'Delivery Van Fleet',
                    category: 'Logistics Vehicles',
                    funded_amount: 8000000,
                    goal_amount: 8000000,
                    estimated_roi: 12.8,
                    status: PROJECT_STATUS.ACTIVE,
                    duration_days: 7,
                  },
                  amount: 500000,
                  status: 'active',
                  invested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: 'inv-2',
                  project_id: '1',
                  project: {
                    id: '1',
                    name: 'Agriculture Farm Equipment',
                    category: 'Farm Equipment',
                    funded_amount: 2500000,
                    goal_amount: 5000000,
                    estimated_roi: 15.5,
                    status: PROJECT_STATUS.FUNDING,
                    duration_days: 14,
                  },
                  amount: 600000,
                  status: 'active',
                  invested_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: 'inv-3',
                  project_id: '8',
                  project: {
                    id: '8',
                    name: 'Mobile App Development',
                    category: 'Technology',
                    funded_amount: 9500000,
                    goal_amount: 9500000,
                    estimated_roi: 28.3,
                    status: PROJECT_STATUS.ACTIVE,
                    duration_days: 21,
                  },
                  amount: 750000,
                  status: 'active',
                  invested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ]
              
              setUserInvestments(mockUserInvestments)
            } catch (error) {
              console.error('Error fetching user investments:', error)
            }
          }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleProjectClick = (project: any) => {
    setSelectedProject(project)
    setSelectedLevel(null)
    setIsDetailsOpen(true)
  }

  const handleLevelSelect = (project: any, level: ProjectLevel) => {
    setLevelsSheetProject(null)
    setSelectedProject(project)
    setSelectedLevel(level)
    setIsDetailsOpen(true)
  }

  const handleShowLevels = (project: any) => {
    const levels = PROJECT_LEVEL_OPTIONS[project.id] || []
    if (levels.length === 0) {
      handleProjectClick(project)
      return
    }
    const userInvestment = userInvestments.find((inv) => inv.project.id === project.id)
    const activeLevel = userInvestment
      ? levels.find((level) => level.priceXaf === userInvestment.amount) || null
      : null

    setLevelsSheetProject({
      project,
      levels,
      activeLevel,
    })
  }

  const handleInvest = (options?: { level?: ProjectLevel | null; amount?: number }) => {
    // TODO: Navigate to investment flow with selected level and amount
    console.log('Invest in project:', selectedProject?.id, options)
  }

  const featuredProjectIds = new Set(['1', '7'])
  const visibleProjects = projects.filter(
    (project) => project.status === PROJECT_STATUS.ACTIVE || featuredProjectIds.has(project.id)
  )

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        {/* Market Header with Search - Fixed */}
        <MarketHeader 
          onSearch={handleSearch}
          onFilterClick={() => setIsFilterOpen(true)}
          totalInvested={totalInvested}
          totalExpected={totalExpected}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Content with padding for fixed header */}
        <div className="pt-[140px]">
        {/* Category Filter Pills - Sticky below header */}
        <div className="sticky top-[108px] z-40 theme-bg-primary pt-3 pb-2 theme-border border-b">
          <CategoryFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Projects Sections */}
        <div className="pt-4">
          {loading ? (
            <>
              {/* Skeleton Cards */}
              <div className="px-4 mb-6">
                <div className="h-6 w-48 theme-bg-tertiary rounded mb-3 animate-pulse"></div>
                <div className="overflow-x-auto scrollbar-hide scroll-smooth">
                  <div className="flex gap-4 pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-shrink-0 w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                        <ProjectSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* All Projects Skeleton */}
              <div className="px-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* My Active Investments Section */}
              {userInvestments.length > 0 && (
                <div className="mb-6">
                  <div className="px-4 mb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">{t('activeInvestments')}</h2>
                      <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                        {userInvestments.length} {t('active')}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide scroll-smooth">
                    <div
                      className="flex items-start gap-4 px-4 pb-2"
                      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                    >
                      {userInvestments.map((inv) => {
                        const investmentLevels = PROJECT_LEVEL_OPTIONS[inv.project.id] || []
                        const activeLevel = investmentLevels.find((level) => level.priceXaf === inv.amount) || null

                        return (
                          <div key={inv.project.id} className="flex-shrink-0 w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                            <ProjectMarketCard
                              id={inv.project.id}
                              name={inv.project.name}
                              category={inv.project.category}
                              fundedAmount={inv.project.funded_amount}
                              goalAmount={inv.project.goal_amount}
                              estimatedRoi={inv.project.estimated_roi}
                              status={inv.project.status}
                              durationDays={inv.project.duration_days}
                              onClick={() => handleProjectClick(inv.project)}
                              isUserInvestment={true}
                              userInvestmentAmount={inv.amount}
                              levels={investmentLevels}
                              activeLevel={activeLevel}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* All Projects Section */}
              {visibleProjects.length > 0 && (
                <div className="mb-6 pb-28">
                  <div className="px-4 mb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">{t('allProjects')}</h2>
                      <button
                        onClick={() => setIsSortOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f24] border border-[#2d2d35] rounded-lg text-white text-sm hover:bg-[#25252a] hover:border-[#3a3a44] transition-colors cursor-pointer"
                      >
                        <HiSortAscending className="w-4 h-4" />
                        <span>{t('sort')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide scroll-smooth">
                    <div
                      className="flex items-start gap-4 px-4 pb-2"
                      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                    >
                      {visibleProjects.map((project) => {
                        const projectLevels = PROJECT_LEVEL_OPTIONS[project.id] || []
                        return (
                          <div key={project.id} className="flex-shrink-0 w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                            <ProjectMarketCard
                              id={project.id}
                              name={project.name}
                              category={project.category}
                              fundedAmount={project.funded_amount}
                              goalAmount={project.goal_amount}
                              estimatedRoi={project.estimated_roi}
                              status={project.status}
                              durationDays={project.duration_days}
                              onClick={() => handleProjectClick(project)}
                            levels={projectLevels}
                            onShowLevels={() => handleShowLevels(project)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {visibleProjects.length === 0 && userInvestments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#a0a0a8] text-lg mb-2">
                    {t('noProjectsFound')}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {searchQuery ? t('tryDifferentSearch') : t('checkBackLater')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sort Modal */}
        <BottomSheet
          isOpen={isSortOpen}
          onClose={() => setIsSortOpen(false)}
          title={t('sortProjects')}
        >
          <div className="px-5 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{t('sortBy')}</label>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value)
                setIsSortOpen(false)
              }}>
                <SelectTrigger className="w-full bg-[#1f1f24] border-[#2d2d35] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f24] border-[#2d2d35]">
                  <SelectItem value="newest" className="text-white hover:bg-[#2d2d35]">
                    {t('newestFirst')}
                  </SelectItem>
                  <SelectItem value="roi" className="text-white hover:bg-[#2d2d35]">
                    {t('highestRoi')}
                  </SelectItem>
                  <SelectItem value="progress" className="text-white hover:bg-[#2d2d35]">
                    {t('mostFunded')}
                  </SelectItem>
                </SelectContent>
              </Select>
                </div>
              </div>
            </BottomSheet>
        </div>

        {/* Levels Sheet */}
        {levelsSheetProject && (
          <BottomSheet
            isOpen={Boolean(levelsSheetProject)}
            onClose={() => setLevelsSheetProject(null)}
            title={levelsSheetProject.project.name}
          >
            <div className="px-5 py-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm theme-text-secondary">
                    {levelsSheetProject.project.category}
                  </span>
                  {levelsSheetProject.project.status === PROJECT_STATUS.ACTIVE ? (
                    <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                      {t('active')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                      {t('funding')}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#10b981]">
                  ROI: {formatPercentage(levelsSheetProject.project.estimated_roi)}
                </div>
              </div>
              <div className="space-y-3">
                {levelsSheetProject.levels.map((level) => {
                  const isActive = levelsSheetProject.activeLevel?.id === level.id
                  return (
                    <div
                      key={level.id}
                      className={cn(
                        'relative theme-bg-secondary theme-border border rounded-xl p-4 overflow-hidden transition-colors',
                        isActive && 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                      )}
                    >
                      {level.tag && (
                        <span className="absolute top-2 left-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4d4f] text-white rounded-r">
                          {level.tag}
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide">
                            {t('levelLabel', { defaultValue: 'Level' })}
                          </p>
                          <h4 className="text-lg font-bold theme-text-primary">{level.level}</h4>
                        </div>
                        <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-[#8b5cf6]/20 text-[#8b5cf6]">
                          {level.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide mb-1">
                            {t('priceLabel', { defaultValue: 'Price' })}
                          </p>
                          <p className="text-sm font-semibold theme-text-primary">
                            {formatCurrency(level.priceXaf)}
                          </p>
                          <p className="text-xs theme-text-secondary">
                            {formatCurrencyUSD(level.priceXaf)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase font-semibold theme-text-muted tracking-wide mb-1">
                            {t('hourlyReturnLabel', { defaultValue: 'Earnings per hour' })}
                          </p>
                          <p className="text-sm font-semibold text-[#10b981]">
                            {formatCurrency(level.hourlyReturnXaf)}
                          </p>
                          <p className="text-xs text-[#10b981]/70">
                            {formatCurrencyUSD(level.hourlyReturnXaf)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleLevelSelect(levelsSheetProject.project, level)}
                        className={cn(
                          'w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] theme-text-primary font-semibold mt-4',
                          isActive && 'opacity-80 cursor-default'
                        )}
                        size="sm"
                        disabled={isActive}
                      >
                        {isActive
                          ? t('selectedLevelButton', { defaultValue: 'Selected level' })
                          : t('investInLevel', { level: level.level, defaultValue: `Invest in ${level.level}` })}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </BottomSheet>
        )}

        {/* Project Details Sheet */}
        {selectedProject && (
          <ProjectDetailsSheet
            isOpen={isDetailsOpen}
            onClose={() => {
              // Small delay to allow animation to complete
              setTimeout(() => {
                setSelectedProject(null)
              }, 350)
              setIsDetailsOpen(false)
            }}
            project={{
              id: selectedProject.id,
              name: selectedProject.name,
              category: selectedProject.category,
              fundedAmount: selectedProject.funded_amount,
              goalAmount: selectedProject.goal_amount,
              estimatedRoi: selectedProject.estimated_roi,
              status: selectedProject.status,
              durationDays: selectedProject.duration_days,
            }}
            selectedLevel={selectedLevel}
            onInvest={handleInvest}
          />
        )}

        {/* Filter Sheet */}
        <FilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onApplyFilters={(newFilters) => {
            setFilters(newFilters)
          }}
          onReset={() => {
            setFilters({
              status: [],
              minRoi: null,
              maxRoi: null,
              minDuration: null,
              maxDuration: null,
              minGoal: null,
              maxGoal: null,
            })
          }}
        />
      </div>
    </AppLayout>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="min-h-screen theme-bg-primary pt-[140px]">
          <div className="px-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 theme-bg-tertiary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    }>
      <MarketplacePageContent />
    </Suspense>
  )
}

