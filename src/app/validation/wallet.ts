import { z } from 'zod'
import { MIN_DEPOSIT_AMOUNT, MIN_WITHDRAWAL_AMOUNT, MAX_WITHDRAWAL_AMOUNT } from '../constants/projects'

export const depositSchema = z.object({
  amount: z.number().min(MIN_DEPOSIT_AMOUNT, `Minimum deposit is ${MIN_DEPOSIT_AMOUNT} XAF`),
  payment_method: z.enum(['orange_money', 'mtn_mobile_money']),
  phone: z.string().regex(/^\+?237\d{9}$/, 'Invalid phone number format'),
})

export const withdrawalSchema = z.object({
  amount: z
    .number()
    .min(MIN_WITHDRAWAL_AMOUNT, `Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT} XAF`)
    .max(MAX_WITHDRAWAL_AMOUNT, `Maximum withdrawal is ${MAX_WITHDRAWAL_AMOUNT} XAF`),
  payment_method: z.enum(['orange_money', 'mtn_mobile_money']),
  phone: z.string().regex(/^\+?237\d{9}$/, 'Invalid phone number format'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
})

export type DepositInput = z.infer<typeof depositSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>

