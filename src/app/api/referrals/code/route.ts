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

    // Get user's referral code
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching referral code:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch referral code' },
        { status: 500 }
      )
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      referral_code: userProfile.referral_code,
    })
  } catch (error: any) {
    console.error('Error in GET /api/referrals/code:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

