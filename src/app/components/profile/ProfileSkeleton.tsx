export function ProfileSkeleton() {
  return (
    <div className="min-h-screen theme-bg-primary animate-pulse">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 theme-bg-primary px-4 py-3 flex items-center justify-between border-b theme-border">
        <div className="h-5 w-20 theme-bg-tertiary rounded"></div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 theme-bg-tertiary rounded"></div>
          <div className="w-6 h-6 theme-bg-tertiary rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pt-20 pb-6 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 theme-bg-tertiary rounded-full mb-4"></div>
          <div className="h-6 w-40 theme-bg-tertiary rounded mb-1"></div>
          <div className="h-4 w-48 theme-bg-tertiary rounded mb-3"></div>
          <div className="h-6 w-32 theme-bg-tertiary rounded-full"></div>
        </div>

        {/* Cards Skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="theme-bg-secondary theme-border border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-32 theme-bg-tertiary rounded"></div>
              <div className="h-8 w-24 theme-bg-tertiary rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full theme-bg-tertiary rounded"></div>
              <div className="h-4 w-3/4 theme-bg-tertiary rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

