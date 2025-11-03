import { createClient } from '@/app/lib/supabase/server'
import { registerSchema } from '@/app/validation/auth'
import { NextResponse } from 'next/server'
import { REFERRAL_LEVELS } from '@/app/constants/projects'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    const supabase = await createClient()

    // Check if referral code exists
    let referrerId: string | null = null
    if (validated.referral_code) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', validated.referral_code)
        .single()

      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Create auth user
    const signUpCredentials: { email: string; password: string; phone?: string } = {
      email: validated.email || '',
      password: validated.password || `temp_${Date.now()}`,
    }
    if (validated.phone) {
      signUpCredentials.phone = validated.phone
    }
    const { data: authData, error: authError } = await supabase.auth.signUp(signUpCredentials as any)

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: validated.email,
      ...(validated.phone && { phone: validated.phone }),
      full_name: validated.full_name,
      referrer_id: referrerId,
    })

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // Create referral relationships if referrer exists
    if (referrerId) {
      // Create level 1 referral
      await supabase.from('referrals').insert({
        referrer_id: referrerId,
        referred_id: authData.user.id,
        level: REFERRAL_LEVELS.LEVEL_1,
      })

      // Find level 2 referrer (referrer of referrer)
      const { data: level2Referrer } = await supabase
        .from('users')
        .select('referrer_id')
        .eq('id', referrerId)
        .single()

      if (level2Referrer?.referrer_id) {
        await supabase.from('referrals').insert({
          referrer_id: level2Referrer.referrer_id,
          referred_id: authData.user.id,
          level: REFERRAL_LEVELS.LEVEL_2,
        })

        // Find level 3 referrer
        const { data: level3Referrer } = await supabase
          .from('users')
          .select('referrer_id')
          .eq('id', level2Referrer.referrer_id)
          .single()

        if (level3Referrer?.referrer_id) {
          await supabase.from('referrals').insert({
            referrer_id: level3Referrer.referrer_id,
            referred_id: authData.user.id,
            level: REFERRAL_LEVELS.LEVEL_3,
          })
        }
      }
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: validated.email,
        ...(validated.phone && { phone: validated.phone }),
      },
    })
  } catch (error: any) {
    if (error.issues) {
      // Zod validation error
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

