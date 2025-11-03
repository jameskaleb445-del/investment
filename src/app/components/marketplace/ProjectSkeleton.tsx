export function ProjectSkeleton() {
  return (
    <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-lg p-4 animate-pulse w-full h-full flex-shrink-0 relative">
      {/* ROI and circular progress skeleton */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        <div className="h-4 w-12 bg-[#2d2d35] rounded"></div>
        <div className="w-10 h-10 bg-[#2d2d35] rounded-full"></div>
      </div>

      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-3/4 bg-[#2d2d35] rounded"></div>
          <div className="h-3 w-1/2 bg-[#2d2d35] rounded"></div>
          <div className="h-5 w-16 bg-[#2d2d35] rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Input skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-24 bg-[#2d2d35] rounded"></div>
          <div className="h-10 w-full bg-[#2d2d35] rounded-lg"></div>
        </div>

        {/* Project info skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-[#2d2d35] rounded"></div>
          <div className="h-3 w-12 bg-[#2d2d35] rounded"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-9 w-full bg-[#2d2d35] rounded-lg"></div>
      </div>
    </div>
  )
}

