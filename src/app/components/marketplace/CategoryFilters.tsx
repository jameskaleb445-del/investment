'use client'

import { PROJECT_CATEGORIES } from '@/app/constants/projects'
import { cn } from '@/app/lib/utils'
import { useTranslations } from 'next-intl'

interface CategoryFiltersProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilters({ selectedCategory, onCategoryChange }: CategoryFiltersProps) {
  const t = useTranslations('marketplace')
  return (
    <div className="px-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
            selectedCategory === null
              ? "bg-[#8b5cf6] text-white"
              : "theme-bg-secondary theme-text-secondary theme-border border hover:theme-border-secondary"
          )}
        >
          {t('allProjects')}
        </button>
        {PROJECT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
              selectedCategory === category
                ? "bg-[#8b5cf6] text-white"
                : "theme-bg-secondary theme-text-secondary theme-border border hover:theme-border-secondary"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

