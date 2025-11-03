import { ProjectCategory, ProjectStatus } from '../constants/projects'

export interface Project {
  id: string
  name: string
  category: ProjectCategory
  description: string
  location?: string
  goal_amount: number // XAF
  funded_amount: number // XAF
  min_investment: number // XAF
  max_investment: number // XAF
  duration_days: number
  estimated_roi: number // Percentage (e.g., 9 for 9%)
  payout_schedule?: string // e.g., "weekly", "daily", "end_of_cycle"
  status: ProjectStatus
  images: string[] // URLs to Supabase Storage
  admin_id: string
  cycle_start_date?: string
  cycle_end_date?: string
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  update_text: string
  images: string[] // URLs to Supabase Storage
  admin_id: string
  created_at: string
}

export interface ProjectWithUpdates extends Project {
  updates?: ProjectUpdate[]
  investment_count?: number
  funding_percentage?: number
}

