import { z } from 'zod'
import { PROJECT_CATEGORIES, PROJECT_STATUS } from '../constants/projects'

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  category: z.enum(PROJECT_CATEGORIES as [string, ...string[]]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().optional(),
  goal_amount: z.number().min(10000, 'Goal amount must be at least 10,000 XAF'),
  min_investment: z.number().min(1000, 'Minimum investment must be at least 1,000 XAF'),
  max_investment: z.number().min(1000, 'Maximum investment must be at least 1,000 XAF'),
  duration_days: z.number().min(5).max(365, 'Duration must be between 5 and 365 days'),
  estimated_roi: z.number().min(1).max(100, 'ROI must be between 1% and 100%'),
  payout_schedule: z.enum(['daily', 'weekly', 'end_of_cycle']).optional(),
  status: z.enum([
    PROJECT_STATUS.DRAFT,
    PROJECT_STATUS.FUNDING,
    PROJECT_STATUS.ACTIVE,
    PROJECT_STATUS.COMPLETED,
  ] as [string, ...string[]]),
  images: z.array(z.string().url()).optional(),
}).refine((data) => data.max_investment >= data.min_investment, {
  message: 'Maximum investment must be greater than or equal to minimum investment',
}).refine((data) => data.max_investment <= data.goal_amount, {
  message: 'Maximum investment cannot exceed goal amount',
})

export const projectUpdateSchema = z.object({
  update_text: z.string().min(10, 'Update text must be at least 10 characters'),
  images: z.array(z.string().url()).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>

