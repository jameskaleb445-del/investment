export function ReferralsSkeleton() {
  return (
    <div className="min-h-screen bg-[#1a1a1f] animate-pulse">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1f] px-4 py-3 flex items-center justify-between border-b border-[#2d2d35]">
        <div className="flex-1"></div>
        <div className="h-5 w-24 bg-[#2d2d35] rounded"></div>
        <div className="flex-1 flex justify-end">
          <div className="w-6 h-6 bg-[#2d2d35] rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-20 pb-28 px-4 space-y-6">
        {/* Referral Code Skeleton */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
          <div className="h-4 w-32 bg-[#2d2d35] rounded mb-3"></div>
          <div className="h-12 w-full bg-[#2d2d35] rounded-lg"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
              <div className="h-3 w-20 bg-[#2d2d35] rounded mb-2"></div>
              <div className="h-6 w-24 bg-[#2d2d35] rounded mb-1"></div>
              <div className="h-3 w-16 bg-[#2d2d35] rounded"></div>
            </div>
          ))}
        </div>

        {/* Referral Tree Skeleton */}
        <div>
          <div className="h-5 w-48 bg-[#2d2d35] rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((level) => (
              <div key={level} className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
                <div className="h-4 w-24 bg-[#2d2d35] rounded mb-3"></div>
                <div className="space-y-3">
                  {[1, 2].map((user) => (
                    <div key={user} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2d2d35] rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-[#2d2d35] rounded mb-1"></div>
                        <div className="h-3 w-24 bg-[#2d2d35] rounded"></div>
                      </div>
                      <div className="h-4 w-16 bg-[#2d2d35] rounded"></div>
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

