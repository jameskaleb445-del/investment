import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface DailyRewardStatus {
  dailyReward: number
  streak: number
  canClaim: boolean
  lastClaimDate: string | null
  claimedToday: boolean
  claimedDates: string[]
}

export function useDailyRewards() {
  return useQuery<DailyRewardStatus>({
    queryKey: ['daily-rewards', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/daily-rewards')
      if (!response.ok) {
        throw new Error('Failed to fetch daily reward status')
      }
      return response.json()
    },
  })
}

export function useClaimDailyReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/daily-rewards', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim daily reward')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch wallet balance and transactions immediately
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['daily-rewards'] })
      // Force refetch immediately
      queryClient.refetchQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.refetchQueries({ queryKey: ['transactions'] })
    },
  })
}

