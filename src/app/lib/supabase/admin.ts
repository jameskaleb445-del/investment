import { createAdminClient } from './server'

/**
 * Admin Supabase client instance
 * This bypasses RLS and has full admin access
 * Use with caution - only for server-side operations that require admin privileges
 */
export const adminClient = createAdminClient()

