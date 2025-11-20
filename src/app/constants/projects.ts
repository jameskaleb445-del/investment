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

// Investment Level Structure (10 levels)
export interface InvestmentLevel {
  level: number
  levelName: string // 'LV1', 'LV2', etc.
  stakeXaf: number
  dailyRoi: number // Percentage (e.g., 12.0 for 12%)
  dailyProfitXaf: number
  hourlyProfitXaf: number
  referralBonusPercent: number // Percentage (e.g., 26 for 26%)
  referralBonusXaf: number
  maxEarningsMultiplier: number // Default 2.0 (2x cap)
}

export const INVESTMENT_LEVELS: InvestmentLevel[] = [
  {
    level: 1,
    levelName: 'LV1',
    stakeXaf: 5000,
    dailyRoi: 12.0,
    dailyProfitXaf: 600,
    hourlyProfitXaf: 25.0,
    referralBonusPercent: 26.0,
    referralBonusXaf: 1300,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 2,
    levelName: 'LV2',
    stakeXaf: 10000,
    dailyRoi: 12.5,
    dailyProfitXaf: 1250,
    hourlyProfitXaf: 52.1,
    referralBonusPercent: 30.0,
    referralBonusXaf: 3000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 3,
    levelName: 'LV3',
    stakeXaf: 20000,
    dailyRoi: 13.0,
    dailyProfitXaf: 2600,
    hourlyProfitXaf: 108.3,
    referralBonusPercent: 32.5,
    referralBonusXaf: 6500,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 4,
    levelName: 'LV4',
    stakeXaf: 40000,
    dailyRoi: 13.5,
    dailyProfitXaf: 5400,
    hourlyProfitXaf: 225.0,
    referralBonusPercent: 35.0,
    referralBonusXaf: 14000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 5,
    levelName: 'LV5',
    stakeXaf: 80000,
    dailyRoi: 14.0,
    dailyProfitXaf: 11200,
    hourlyProfitXaf: 466.7,
    referralBonusPercent: 35.0,
    referralBonusXaf: 28000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 6,
    levelName: 'LV6',
    stakeXaf: 120000,
    dailyRoi: 14.5,
    dailyProfitXaf: 17400,
    hourlyProfitXaf: 725.0,
    referralBonusPercent: 35.0,
    referralBonusXaf: 42000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 7,
    levelName: 'LV7',
    stakeXaf: 200000,
    dailyRoi: 15.0,
    dailyProfitXaf: 30000,
    hourlyProfitXaf: 1250.0,
    referralBonusPercent: 35.0,
    referralBonusXaf: 70000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 8,
    levelName: 'LV8',
    stakeXaf: 320000,
    dailyRoi: 15.5,
    dailyProfitXaf: 49600,
    hourlyProfitXaf: 2066.7,
    referralBonusPercent: 35.0,
    referralBonusXaf: 112000,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 9,
    levelName: 'LV9',
    stakeXaf: 450000,
    dailyRoi: 16.0,
    dailyProfitXaf: 72000,
    hourlyProfitXaf: 3000.0,
    referralBonusPercent: 35.0,
    referralBonusXaf: 157500,
    maxEarningsMultiplier: 2.0,
  },
  {
    level: 10,
    levelName: 'LV10',
    stakeXaf: 600000,
    dailyRoi: 16.5,
    dailyProfitXaf: 99000,
    hourlyProfitXaf: 4125.0,
    referralBonusPercent: 35.0,
    referralBonusXaf: 210000,
    maxEarningsMultiplier: 2.0,
  },
] as const

// Helper function to get investment level by amount
export function getInvestmentLevelByAmount(amount: number): InvestmentLevel | null {
  return INVESTMENT_LEVELS.find(level => level.stakeXaf === amount) || null
}

// Helper function to get referral bonus for an investment amount
export function getReferralBonusForAmount(amount: number): number {
  const level = getInvestmentLevelByAmount(amount)
  if (!level) {
    // Default to 35% for amounts not matching exact levels (capped)
    return amount * 0.35
  }
  return level.referralBonusXaf
}

// Withdrawal Ladder System
export interface WithdrawalLimit {
  withdrawalNumber: number // 1, 2, 3, etc.
  minAmount: number
  maxAmount: number
}

export const WITHDRAWAL_LADDER: WithdrawalLimit[] = [
  { withdrawalNumber: 1, minAmount: 2500, maxAmount: 5000 },
  { withdrawalNumber: 2, minAmount: 4000, maxAmount: 10000 },
  { withdrawalNumber: 3, minAmount: 10000, maxAmount: 20000 },
  { withdrawalNumber: 4, minAmount: 20000, maxAmount: 40000 },
  { withdrawalNumber: 5, minAmount: 40000, maxAmount: 100000 },
  // Withdrawal 6+: min 40k, max = 40% of balance OR highest active stake
]

export const WITHDRAWAL_COOLDOWN_HOURS = 48 // 48-hour cooldown between withdrawals

export const PLATFORM_FEES = {
  DEPOSIT: 0.01, // 1%
  WITHDRAWAL: 0.05, // 5% (updated from 1.5%)
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

