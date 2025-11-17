import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Get total referral earnings grouped by level
    const { data: earnings, error } = await supabase
      .from('referral_earnings')
      .select('amount, level, created_at, transaction_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referral earnings:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch referral earnings' },
        { status: 500 }
      )
    }

    // Calculate totals by level
    const level1Earnings =
      earnings
        ?.filter((e) => e.level === 1)
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const level2Earnings =
      earnings
        ?.filter((e) => e.level === 2)
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const level3Earnings =
      earnings
        ?.filter((e) => e.level === 3)
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const totalEarnings = level1Earnings + level2Earnings + level3Earnings

    // Get total referrals count
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id)

    // Get user's referral code
    const { data: userProfile } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      referral_code: userProfile?.referral_code || '',
      totalReferrals: totalReferrals || 0,
      totalEarnings,
      level1Earnings,
      level2Earnings,
      level3Earnings,
      earnings: earnings || [],
    })
  } catch (error: any) {
    console.error('Error in GET /api/referrals/earnings:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

