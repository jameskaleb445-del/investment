export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#1a1a1f] animate-pulse">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1f] px-4 py-3 flex items-center justify-between border-b border-[#2d2d35]">
        <div className="h-5 w-20 bg-[#2d2d35] rounded"></div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#2d2d35] rounded"></div>
          <div className="w-6 h-6 bg-[#2d2d35] rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pt-20 pb-6 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-[#2d2d35] rounded-full mb-4"></div>
          <div className="h-6 w-40 bg-[#2d2d35] rounded mb-1"></div>
          <div className="h-4 w-48 bg-[#2d2d35] rounded mb-3"></div>
          <div className="h-6 w-32 bg-[#2d2d35] rounded-full"></div>
        </div>

        {/* Cards Skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-32 bg-[#2d2d35] rounded"></div>
              <div className="h-8 w-24 bg-[#2d2d35] rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#2d2d35] rounded"></div>
              <div className="h-4 w-3/4 bg-[#2d2d35] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

