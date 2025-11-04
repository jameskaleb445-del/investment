'use client'

import { ProjectMarketCard } from './ProjectMarketCard'

interface Project {
  id: string
  name: string
  category: string
  funded_amount: number
  goal_amount: number
  estimated_roi: number
  status: string
  duration_days: number
}

interface ProjectCarouselProps {
  projects: Project[]
  title?: string
  onProjectClick?: (project: Project) => void
}

export function ProjectCarousel({ projects, title, onProjectClick }: ProjectCarouselProps) {
  if (projects.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {title && (
        <div className="px-4 mb-3">
          <h2 className="text-lg font-semibold theme-text-primary">Recommended Projects</h2>
        </div>
      )}
      <div className="overflow-x-auto scrollbar-hide scroll-smooth">
        <div className="flex gap-4 px-4 pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {projects.map((project) => (
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
                onClick={() => onProjectClick?.(project)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

