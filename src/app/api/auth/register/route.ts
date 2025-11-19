import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { registerSchema } from '@/app/validation/auth'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

/**
 * Registration - Creates user immediately with auto-confirmed email
 * - Validates registration data (email, password, full_name)
 * - Creates user with auto-confirmed email
 * - Creates user profile and wallet
 * - Handles referral code
 * - Returns session for user to setup PIN
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Rate limit by email and IP
    const identifier = validated.email
    const ip = getClientIdentifier(request)

    const identifierLimit = checkRateLimit(
      `register:${identifier}`,
      RATE_LIMITS.AUTH_REGISTER
    )

    const ipLimit = checkRateLimit(
      `register-ip:${ip}`,
      RATE_LIMITS.AUTH_REGISTER
    )

    if (!identifierLimit.allowed) {
      const retryAfter = Math.ceil(
        (identifierLimit.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_REGISTER.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(identifierLimit.resetTime).toISOString(),
          },
        }
      )
    }

    if (!ipLimit.allowed) {
      const retryAfter = Math.ceil((ipLimit.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many requests from this IP. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_REGISTER.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if user already exists
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email)
      .single()

    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Find referrer if referral code exists - validate that it's a valid code
    let referrerId: string | null = null
    if (validated.referral_code) {
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', validated.referral_code.toUpperCase())
        .single()

      if (referrerError || !referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code. Please check and try again.' },
          { status: 400 }
        )
      }

      referrerId = referrer.id
    }

    // Create user with admin client to auto-confirm email
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: validated.full_name,
        referral_code: validated.referral_code || null,
      },
    })

    if (authError || !authData.user) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user. Please try again.' },
        { status: 500 }
      )
    }

    // Wait a moment for the trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if profile was created by trigger, if not create it manually
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !userProfile) {
      // Create user profile manually
      const { error: createProfileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: validated.email,
        full_name: validated.full_name,
        referrer_id: referrerId,
        email_verified: true, // Email is auto-confirmed
        phone_verified: false,
        pin_set: false,
        registration_complete: false,
      })

      if (createProfileError) {
        console.error('Error creating user profile:', createProfileError)
        // Rollback auth user if profile creation fails
        try {
          await adminClient.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Failed to rollback auth user:', deleteError)
        }
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try again.' },
          { status: 500 }
        )
      }

      // Update referrer_id if needed (trigger might have created profile without referrer_id)
      if (referrerId) {
        await supabase
          .from('users')
          .update({ referrer_id: referrerId })
          .eq('id', authData.user.id)
      }
    } else if (referrerId) {
      // Profile exists, update referrer_id if needed
      await supabase
        .from('users')
        .update({ referrer_id: referrerId })
        .eq('id', authData.user.id)
    }

    // Create wallet if it doesn't exist (trigger should have created it, but check anyway)
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: authData.user.id,
        balance: 0,
        invested_amount: 0,
        pending_withdrawal: 0,
        total_earnings: 0,
      })
      .select()
      .single()

    // Ignore wallet error if it already exists (trigger might have created it)
    if (walletError && walletError.code !== '23505') {
      console.error('Error creating wallet:', walletError)
    }

    // Create referral relationships if referrer exists
    if (referrerId) {
      const { REFERRAL_LEVELS } = await import('@/app/constants/projects')
      
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

    // Return success - client will sign in to establish session
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: validated.full_name,
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
