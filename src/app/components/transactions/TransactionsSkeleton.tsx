export function TransactionsSkeleton() {
  return (
    <div className="p-4 space-y-6 pb-6 animate-pulse">
      {/* Date Group Skeleton */}
      {[1, 2].map((dateGroup) => (
        <div key={dateGroup} className="space-y-3">
          {/* Date Label */}
          <div className="h-3 w-24 bg-[#2d2d35] rounded px-2"></div>
          
          {/* Transaction Cards */}
          <div className="space-y-2">
            {[1, 2, 3].map((transaction) => (
              <div
                key={transaction}
                className="theme-bg-secondary theme-border border rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Icon Skeleton */}
                  <div className="w-11 h-11 rounded-full bg-[#2d2d35] flex-shrink-0"></div>

                  {/* Content Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      {/* Title */}
                      <div className="h-4 w-40 bg-[#2d2d35] rounded flex-1"></div>
                      {/* Amount */}
                      <div className="h-4 w-24 bg-[#2d2d35] rounded"></div>
                    </div>
                    
                    {/* Subtitle and Status */}
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-[#2d2d35] rounded"></div>
                      <div className="h-5 w-16 bg-[#2d2d35] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

