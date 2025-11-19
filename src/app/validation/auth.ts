import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?237\d{9}$/, 'Invalid phone number format').optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referral_code: z.string().optional(),
})

export const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['login', 'withdrawal', 'deposit', 'register', 'verification']),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export const pinSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d{4}$/, 'PIN must be numeric'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OTPInput = z.infer<typeof otpSchema>
export type PINInput = z.infer<typeof pinSchema>

