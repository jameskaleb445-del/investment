import React from 'react'

interface ProgressBarProps {
  value: number // Percentage (0-100)
  max?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-[#2d2d35] rounded-full h-2.5">
        <div
          className="bg-[#8b5cf6] h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

