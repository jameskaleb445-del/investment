import type { Wallet } from './Wallet'

export interface User {
  id: string
  email?: string
  phone?: string
  full_name?: string
  referrer_id?: string
  referral_code: string
  role: 'user' | 'admin'
  created_at: string
  updated_at?: string
}

export interface UserProfile extends User {
  wallet?: Wallet
  total_investments?: number
  total_earnings?: number
  referral_count?: number
}

