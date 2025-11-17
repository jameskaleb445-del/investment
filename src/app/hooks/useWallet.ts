import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface WalletData {
  balance: number
  invested_amount: number
  pending_withdrawal: number
  total_earnings: number
  available_balance: number
}

export function useWallet() {
  return useQuery<WalletData>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await fetch('/api/wallet/balance')
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance')
      }
      return response.json()
    },
  })
}

export function useInvalidateWallet() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  }
}

