'use client'

import { useState, useEffect, Suspense } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import MarketHeader from '@/app/components/marketplace/MarketHeaderXAF'
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

// Levels are now fetched from the database via the API

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
  const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const totalExpected = userInvestments.reduce((sum, inv) => {
    if (!inv.project) return sum
    const expectedReturn = (inv.amount || 0) + ((inv.amount || 0) * (inv.project.estimated_roi || 0) / 100)
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
      // Build query parameters
      const params = new URLSearchParams()
      
      // Filter by category
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      // Filter by status
      if (filters.status.length > 0) {
        // API supports single status, so we'll filter client-side for multiple
        params.append('status', filters.status[0])
      }
      
      // Fetch from API
      const response = await fetch(`/api/projects?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      let filtered = data.projects || []
      
      // Client-side filtering for advanced filters
      // Filter by search
      if (searchQuery) {
        filtered = filtered.filter((p: any) => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Filter by status (multiple)
      if (filters.status.length > 0) {
        filtered = filtered.filter((p: any) => filters.status.includes(p.status))
      }
      
      // Filter by ROI range
      if (filters.minRoi !== null) {
        filtered = filtered.filter((p: any) => Number(p.estimated_roi) >= filters.minRoi!)
      }
      if (filters.maxRoi !== null) {
        filtered = filtered.filter((p: any) => Number(p.estimated_roi) <= filters.maxRoi!)
      }
      
      // Filter by duration range
      if (filters.minDuration !== null) {
        filtered = filtered.filter((p: any) => Number(p.duration_days) >= filters.minDuration!)
      }
      if (filters.maxDuration !== null) {
        filtered = filtered.filter((p: any) => Number(p.duration_days) <= filters.maxDuration!)
      }
      
      // Filter by goal amount range
      if (filters.minGoal !== null) {
        filtered = filtered.filter((p: any) => Number(p.goal_amount) >= filters.minGoal!)
      }
      if (filters.maxGoal !== null) {
        filtered = filtered.filter((p: any) => Number(p.goal_amount) <= filters.maxGoal!)
      }
      
      // Sort
      if (sortBy === 'roi') {
        filtered.sort((a: any, b: any) => Number(b.estimated_roi) - Number(a.estimated_roi))
      } else if (sortBy === 'progress') {
        filtered.sort((a: any, b: any) => {
          const progressA = (Number(a.funded_amount) / Number(a.goal_amount)) * 100
          const progressB = (Number(b.funded_amount) / Number(b.goal_amount)) * 100
          return progressB - progressA
        })
      } else {
        // Already sorted by created_at DESC from API, so no need to reverse
      }
      
      setProjects(filtered)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInvestments = async () => {
    try {
      // Fetch user's active investments
      const response = await fetch('/api/investments?status=active')
      if (!response.ok) {
        throw new Error('Failed to fetch user investments')
      }
      
      const data = await response.json()
      // Format investments to match expected structure
      const formattedInvestments = (data.investments || []).map((inv: any) => ({
        id: inv.id,
        project_id: inv.project_id,
        project: inv.projects ? {
          id: inv.projects.id,
          name: inv.projects.name,
          category: inv.projects.category,
          funded_amount: inv.projects.funded_amount || 0,
          goal_amount: inv.projects.goal_amount || 0,
          estimated_roi: inv.projects.estimated_roi || 0,
          status: inv.projects.status,
          duration_days: inv.projects.duration_days || 0,
        } : null,
        amount: Number(inv.amount),
        status: inv.status,
        invested_at: inv.invested_date || inv.created_at,
      })).filter((inv: any) => inv.project !== null) // Filter out investments without project data
      
      setUserInvestments(formattedInvestments)
    } catch (error) {
      console.error('Error fetching user investments:', error)
      setUserInvestments([])
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
    // Use levels from database (project.levels)
    const levels = project.levels && project.levels.length > 0 
      ? project.levels 
      : []
    
    if (levels.length === 0) {
      // If no levels exist, show project details instead
      handleProjectClick(project)
      return
    }
    
    const userInvestment = userInvestments.find((inv) => inv.project && inv.project.id === project.id)
    const activeLevel = userInvestment
      ? levels.find((level: ProjectLevel) => level.priceXaf === userInvestment.amount) || null
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

  // Show all projects (filtering is done server-side and client-side)
  const visibleProjects = projects

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
                      <h2 className="text-lg font-semibold theme-text-primary">{t('activeInvestments')}</h2>
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
                        if (!inv.project) return null
                        // Use levels from database
                        const investmentLevels = inv.project.levels && inv.project.levels.length > 0
                          ? inv.project.levels
                          : []
                        const activeLevel = investmentLevels.find((level: ProjectLevel) => level.priceXaf === inv.amount) || null

                        return (
                          <div key={inv.id} className="flex-shrink-0 w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                            <ProjectMarketCard
                              id={inv.project.id}
                              name={inv.project.name}
                              category={inv.project.category}
                              fundedAmount={Number(inv.project.funded_amount || 0)}
                              goalAmount={Number(inv.project.goal_amount || 0)}
                              estimatedRoi={Number(inv.project.estimated_roi || 0)}
                              status={inv.project.status}
                              durationDays={Number(inv.project.duration_days || 0)}
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
                      <h2 className="text-lg font-semibold theme-text-primary">{t('allProjects')}</h2>
                      <button
                        onClick={() => setIsSortOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f24] border border-[#2d2d35] rounded-lg text-white text-sm hover:bg-[#25252a] hover:border-[#3a3a44] transition-colors cursor-pointer"
                      >
                        <HiSortAscending className="w-4 h-4" />
                        <span>{t('sort')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="grid grid-cols-2 gap-3 pb-2">
                      {visibleProjects.map((project) => {
                        // Use levels from database
                        const projectLevels = project.levels && project.levels.length > 0
                          ? project.levels
                          : []
                        return (
                          <ProjectMarketCard
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            category={project.category}
                            fundedAmount={Number(project.funded_amount || 0)}
                            goalAmount={Number(project.goal_amount || 0)}
                            estimatedRoi={Number(project.estimated_roi || 0)}
                            status={project.status}
                            durationDays={Number(project.duration_days || 0)}
                            onClick={() => handleProjectClick(project)}
                            levels={projectLevels}
                            onShowLevels={() => handleShowLevels(project)}
                          />
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
              <label className="text-sm font-medium theme-text-primary">{t('sortBy')}</label>
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
                      {/* Investment Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs theme-text-secondary">
                            {t('youInvestLabel', { defaultValue: 'You invest' })}
                          </span>
                          <span className="text-sm font-semibold theme-text-primary">
                            {formatCurrency(level.priceXaf)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs theme-text-secondary">
                            {t('youEarnPerHour', {
                              amount: formatCurrency(level.hourlyReturnXaf),
                              defaultValue: `Earn ${formatCurrency(level.hourlyReturnXaf)}/hour`,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#10b981] font-medium">
                          <span className="text-xs">
                            {t('estimatedMaturity', {
                              amount: formatCurrency(
                                level.priceXaf + (level.priceXaf * levelsSheetProject.project.estimated_roi / 100)
                              ),
                              days: levelsSheetProject.project.duration_days || 0,
                              defaultValue: `Est. ${formatCurrency(
                                level.priceXaf + (level.priceXaf * levelsSheetProject.project.estimated_roi / 100)
                              )} in ${levelsSheetProject.project.duration_days || 0} days`,
                            })}
                          </span>
                        </div>
                        {levelsSheetProject.project.duration_days && levelsSheetProject.project.duration_days > 0 && (
                          <div className="text-[11px] text-[#facc15]">
                            {t('earlyExitSample', {
                              days: Math.max(1, Math.round((levelsSheetProject.project.duration_days || 0) / 2)),
                              amount: formatCurrency(
                                level.priceXaf + 
                                (level.priceXaf * levelsSheetProject.project.estimated_roi / 100) * 
                                (Math.max(1, Math.round((levelsSheetProject.project.duration_days || 0) / 2)) / (levelsSheetProject.project.duration_days || 1))
                              ),
                              defaultValue: `Exit after ${Math.max(1, Math.round((levelsSheetProject.project.duration_days || 0) / 2))} days → approx. ${formatCurrency(
                                level.priceXaf + 
                                (level.priceXaf * levelsSheetProject.project.estimated_roi / 100) * 
                                (Math.max(1, Math.round((levelsSheetProject.project.duration_days || 0) / 2)) / (levelsSheetProject.project.duration_days || 1))
                              )}`,
                            })}
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t border-[#2d2d35]">
                        <div className="mb-3">
                          <p className="text-[11px] text-[#facc15] mb-2">
                            {t('earlyExitNote', {
                              defaultValue:
                                'If you exit early, profit is prorated and only the worked hours count.',
                            })}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleLevelSelect(levelsSheetProject.project, level)}
                          className={cn(
                            'w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] !text-white font-semibold',
                            isActive && 'opacity-80 cursor-default'
                          )}
                          size="sm"
                          disabled={isActive}
                        >
                          {isActive
                            ? t('selectedLevelButton', { defaultValue: 'Selected level' })
                            : t('investAmount', { amount: formatCurrency(level.priceXaf), defaultValue: `Invest ${formatCurrency(level.priceXaf)}` })}
                        </Button>
                      </div>
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
              fundedAmount: Number(selectedProject.funded_amount || 0),
              goalAmount: Number(selectedProject.goal_amount || 0),
              estimatedRoi: Number(selectedProject.estimated_roi || 0),
              status: selectedProject.status,
              durationDays: Number(selectedProject.duration_days || 0),
              description: selectedProject.description,
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

