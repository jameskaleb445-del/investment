export function ReferralsSkeleton() {
  return (
    <div className="min-h-screen theme-bg-primary animate-pulse">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 theme-bg-primary px-4 py-3 flex items-center justify-between border-b theme-border">
        <div className="flex-1"></div>
        <div className="h-5 w-24 theme-bg-tertiary rounded"></div>
        <div className="flex-1 flex justify-end">
          <div className="w-6 h-6 theme-bg-tertiary rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-20 pb-28 px-4 space-y-6">
        {/* Referral Code Skeleton */}
        <div className="theme-bg-secondary theme-border border rounded-xl p-4">
          <div className="h-4 w-32 theme-bg-tertiary rounded mb-3"></div>
          <div className="h-12 w-full theme-bg-tertiary rounded-lg"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="theme-bg-secondary theme-border border rounded-xl p-4">
              <div className="h-3 w-20 theme-bg-tertiary rounded mb-2"></div>
              <div className="h-6 w-24 theme-bg-tertiary rounded mb-1"></div>
              <div className="h-3 w-16 theme-bg-tertiary rounded"></div>
            </div>
          ))}
        </div>

        {/* Referral Tree Skeleton */}
        <div>
          <div className="h-5 w-48 theme-bg-tertiary rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((level) => (
              <div key={level} className="theme-bg-secondary theme-border border rounded-xl p-4">
                <div className="h-4 w-24 theme-bg-tertiary rounded mb-3"></div>
                <div className="space-y-3">
                  {[1, 2].map((user) => (
                    <div key={user} className="flex items-center gap-3">
                      <div className="w-10 h-10 theme-bg-tertiary rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 theme-bg-tertiary rounded mb-1"></div>
                        <div className="h-3 w-24 theme-bg-tertiary rounded"></div>
                      </div>
                      <div className="h-4 w-16 theme-bg-tertiary rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

