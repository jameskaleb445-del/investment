import { z } from 'zod'

export const investmentSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  amount: z.number().min(1000, 'Minimum investment is 1,000 XAF'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
})

export type InvestmentInput = z.infer<typeof investmentSchema>

