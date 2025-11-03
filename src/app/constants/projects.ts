export const PROJECT_CATEGORIES = [
  'Device Leasing',
  'Retail Micro-Kits',
  'Water Purification',
  'Farm Equipment',
  'Logistics Vehicles',
  'Event Furniture',
  'Ad/Sign Boards',
] as const

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  FUNDING: 'funding',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  INVESTMENT: 'investment',
  ROI_PAYOUT: 'roi_payout',
  REFERRAL_COMMISSION: 'referral_commission',
} as const

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES]

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
} as const

export type WithdrawalStatus =
  (typeof WITHDRAWAL_STATUS)[keyof typeof WITHDRAWAL_STATUS]

export const INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type InvestmentStatus =
  (typeof INVESTMENT_STATUS)[keyof typeof INVESTMENT_STATUS]

export const REFERRAL_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
} as const

export const REFERRAL_COMMISSION_RATES = {
  [REFERRAL_LEVELS.LEVEL_1]: 0.1, // 10%
  [REFERRAL_LEVELS.LEVEL_2]: 0.05, // 5%
  [REFERRAL_LEVELS.LEVEL_3]: 0.02, // 2%
} as const

export const PLATFORM_FEES = {
  DEPOSIT: 0.01, // 1%
  WITHDRAWAL: 0.015, // 1.5%
  PROJECT_MANAGEMENT: 0.015, // 1.5% (configurable per project)
} as const

export const MIN_DEPOSIT_AMOUNT = 1000 // XAF
export const MIN_WITHDRAWAL_AMOUNT = 1000 // XAF
export const MAX_WITHDRAWAL_AMOUNT = 10000000 // XAF (10M)

export const PAYMENT_METHODS = {
  ORANGE_MONEY: 'orange_money',
  MTN_MOBILE_MONEY: 'mtn_mobile_money',
} as const

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

