'use client'

import { PROJECT_CATEGORIES } from '@/app/constants/projects'
import Link from 'next/link'
import { 
  HiDeviceMobile, 
  HiShoppingBag, 
  HiTruck,
  HiPresentationChartLine
} from 'react-icons/hi'
import { MdEventSeat, MdSignpost, MdWaterDrop } from 'react-icons/md'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Device Leasing': HiDeviceMobile,
  'Retail Micro-Kits': HiShoppingBag,
  'Water Purification': MdWaterDrop,
  'Farm Equipment': HiTruck,
  'Logistics Vehicles': HiTruck,
  'Event Furniture': MdEventSeat,
  'Ad/Sign Boards': MdSignpost,
}

interface CategoryIconsProps {
  selectedCategory: string | null
  onCategorySelect: (category: string) => void
  showAll?: boolean
}

export function CategoryIcons({ selectedCategory, onCategorySelect, showAll = false }: CategoryIconsProps) {
  const categoriesToShow = showAll ? PROJECT_CATEGORIES : PROJECT_CATEGORIES.slice(0, 4)

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">
          {showAll ? 'All Categories' : 'Top Categories'}
        </h2>
        {!showAll && (
          <Link href="/marketplace/categories" className="text-sm text-[#8b5cf6] hover:text-[#7c3aed]">
            See all
          </Link>
        )}
      </div>
      <div className={`grid ${showAll ? 'grid-cols-3' : 'grid-cols-4'} gap-4`}>
        {categoriesToShow.map((category) => {
          const Icon = categoryIcons[category] || HiPresentationChartLine
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#8b5cf6] text-white'
                  : 'bg-[#1f1f24] border border-[#2d2d35] text-[#a0a0a8] group-hover:border-[#8b5cf6]/50 group-hover:text-[#8b5cf6]'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-xs text-center font-medium ${
                isSelected ? 'text-white' : 'text-[#a0a0a8] group-hover:text-white'
              }`}>
                {category.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

