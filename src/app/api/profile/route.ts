import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/profile
 * Get current user's profile data including user info, wallet, and referral code
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile from public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: profileError.message || 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get wallet data
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get referral count
    const { count: referralCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id)

    // Return combined profile data
    return NextResponse.json({
      id: profile.id,
      email: user.email || profile.email || '',
      phone: profile.phone || '',
      full_name: profile.full_name || '',
      referral_code: profile.referral_code || '',
      role: profile.role || 'user',
      email_verified: profile.email_verified || false,
      phone_verified: profile.phone_verified || false,
      pin_set: profile.pin_set || false,
      registration_complete: profile.registration_complete || false,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      wallet: wallet ? {
        balance: Number(wallet.balance),
        invested_amount: Number(wallet.invested_amount),
        pending_withdrawal: Number(wallet.pending_withdrawal),
        total_earnings: Number(wallet.total_earnings),
        available_balance: Number(wallet.balance) - Number(wallet.invested_amount) - Number(wallet.pending_withdrawal),
      } : null,
      referral_count: referralCount || 0,
    })
  } catch (error: any) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

