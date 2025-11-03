export interface Wallet {
  id: string
  user_id: string
  balance: number // XAF
  invested_amount: number // XAF
  pending_withdrawal: number // XAF
  total_earnings: number // XAF
  created_at: string
  updated_at: string
}

export interface WalletSummary {
  balance: number
  invested_amount: number
  pending_withdrawal: number
  total_earnings: number
  available_balance: number // balance - invested_amount - pending_withdrawal
}

