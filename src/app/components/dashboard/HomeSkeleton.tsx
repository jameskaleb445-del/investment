export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#1a1a1f] animate-pulse">
      {/* Portfolio Header Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent" />
        
        <div className="relative px-4 pt-6 pb-6">
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-full"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              <div className="w-8 h-8 bg-white/20 rounded-full"></div>
            </div>
          </div>
          
          {/* Balance Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-32 bg-white/20 rounded"></div>
            <div className="h-10 w-48 bg-white/20 rounded"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 bg-white/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pb-28 pt-4 space-y-6">
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
              <div className="h-3 w-20 bg-[#2d2d35] rounded mb-2"></div>
              <div className="h-6 w-24 bg-[#2d2d35] rounded mb-1"></div>
              <div className="h-3 w-16 bg-[#2d2d35] rounded"></div>
            </div>
          ))}
        </div>

        {/* Performance Insights Skeleton */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
          <div className="h-4 w-32 bg-[#2d2d35] rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 bg-[#2d2d35] rounded"></div>
                <div className="h-3 w-16 bg-[#2d2d35] rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Chart Skeleton */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-4 w-32 bg-[#2d2d35] rounded mb-1"></div>
              <div className="h-3 w-20 bg-[#2d2d35] rounded"></div>
            </div>
          </div>
          <div className="h-48 bg-[#2d2d35] rounded"></div>
        </div>

        {/* Active Investments Skeleton */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="h-5 w-40 bg-[#2d2d35] rounded"></div>
            <div className="h-8 w-20 bg-[#2d2d35] rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border-b border-[#2d2d35] pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-[#2d2d35] rounded mb-1"></div>
                    <div className="h-3 w-24 bg-[#2d2d35] rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-20 bg-[#2d2d35] rounded mb-1"></div>
                    <div className="h-3 w-16 bg-[#2d2d35] rounded mb-1"></div>
                    <div className="h-5 w-16 bg-[#2d2d35] rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Skeleton */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-40 bg-[#2d2d35] rounded"></div>
            <div className="h-8 w-20 bg-[#2d2d35] rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2d2d35] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-[#2d2d35] rounded mb-1"></div>
                  <div className="h-3 w-24 bg-[#2d2d35] rounded"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-[#2d2d35] rounded mb-1"></div>
                  <div className="h-3 w-12 bg-[#2d2d35] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

