import {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from '../constants/projects'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number // XAF
  status: TransactionStatus
  payment_method?: PaymentMethod
  reference?: string
  project_id?: string
  created_at: string
  updated_at: string
}

export interface TransactionWithDetails extends Transaction {
  project?: {
    id: string
    name: string
  }
}

