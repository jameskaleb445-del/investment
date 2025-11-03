import { InvestmentStatus } from '../constants/projects'

export interface Investment {
  id: string
  user_id: string
  project_id: string
  amount: number // XAF
  invested_date: string
  expected_return: number // XAF
  actual_return?: number // XAF
  payout_date?: string
  status: InvestmentStatus
  created_at: string
  updated_at: string
}

export interface InvestmentWithProject extends Investment {
  project?: {
    id: string
    name: string
    category: string
    status: string
    cycle_end_date?: string
  }
}

