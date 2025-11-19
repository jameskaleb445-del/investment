import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { registerSchema } from '@/app/validation/auth'
import { REFERRAL_LEVELS } from '@/app/constants/projects'
import crypto from 'crypto'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

/**
 * Step 2: OTP Verification and User Creation
 * - Verifies OTP code
 * - If type is 'register', creates user account and profile
 * - Returns user data and session token for PIN setup
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { otp, type = 'verification', email, phone, otp_id, ...registrationData } = body

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    // Rate limit by email/phone and IP
    const identifier = email || phone || ''
    const ip = getClientIdentifier(request)

    const identifierLimit = checkRateLimit(
      `verify-otp:${identifier}:${type}`,
      RATE_LIMITS.AUTH_VERIFY_OTP
    )

    const ipLimit = checkRateLimit(
      `verify-otp-ip:${ip}`,
      RATE_LIMITS.AUTH_VERIFY_OTP
    )

    if (!identifierLimit.allowed) {
      const retryAfter = Math.ceil(
        (identifierLimit.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: 'Too many OTP verification attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_VERIFY_OTP.maxRequests.toString(),
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
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_VERIFY_OTP.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const supabase = await createClient()

    // Find and verify OTP
    // For reset type, use 'reset', for register use 'register', otherwise 'verification'
    const otpType = type === 'register' ? 'register' : type === 'reset' ? 'reset' : 'verification'
    
    let otpQuery = supabase
      .from('otp_codes')
      .select('*')
      .eq('identifier', identifier)
      .eq('type', otpType)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (otp_id) {
      otpQuery = otpQuery.eq('id', otp_id)
    }

    console.log('[Verify OTP] Querying OTP:', {
      identifier,
      otpType,
      otp_id,
      providedOtp: otp,
    })

    const { data: otpRecords, error: otpQueryError } = await otpQuery

    console.log('[Verify OTP] Query result:', {
      found: !!otpRecords && otpRecords.length > 0,
      count: otpRecords?.length || 0,
      error: otpQueryError?.message,
      errorCode: otpQueryError?.code,
    })

    if (otpQueryError) {
      console.error('[Verify OTP] Query error:', otpQueryError)
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    if (!otpRecords || otpRecords.length === 0) {
      console.log('[Verify OTP] No OTP records found for:', { identifier, otpType })
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    const otpRecord = otpRecords[0]

    console.log('[Verify OTP] Found OTP record:', {
      id: otpRecord.id,
      code: otpRecord.code,
      providedCode: otp,
      type: otpRecord.type,
      identifier: otpRecord.identifier,
      expires_at: otpRecord.expires_at,
      verified: otpRecord.verified,
      match: otpRecord.code === otp,
    })

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at)
    const now = new Date()
    if (expiresAt < now) {
      console.log('[Verify OTP] OTP expired:', {
        expires_at: expiresAt.toISOString(),
        now: now.toISOString(),
        diff: now.getTime() - expiresAt.getTime(),
      })
      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP code
    if (otpRecord.code !== otp) {
      console.log('[Verify OTP] Code mismatch:', {
        stored: otpRecord.code,
        provided: otp,
        match: false,
      })
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    if (type === 'register') {
      // Registration flow: Create user account and profile
      // Use referral_code from OTP record if not provided in body
      const referralCodeFromOTP = otpRecord.referral_code
      const referralCodeFromBody = registrationData.referral_code
      const finalReferralCode = referralCodeFromBody || referralCodeFromOTP || ''
      
      const validatedRegistration = registerSchema.parse({
        email,
        phone,
        ...registrationData,
        referral_code: finalReferralCode || undefined, // Only include if provided
      })

      // Check if referral code exists
      let referrerId: string | null = null
      if (validatedRegistration.referral_code) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', validatedRegistration.referral_code)
          .single()

        if (referrer) {
          referrerId = referrer.id
        }
      }

      // Create auth user
      const signUpCredentials: { email: string; password: string; phone?: string } = {
        email: validatedRegistration.email || '',
        password: validatedRegistration.password || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      }
      if (validatedRegistration.phone) {
        signUpCredentials.phone = validatedRegistration.phone
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
        email: validatedRegistration.email,
        ...(validatedRegistration.phone && { phone: validatedRegistration.phone }),
        full_name: validatedRegistration.full_name,
        referrer_id: referrerId,
        email_verified: !!validatedRegistration.email,
        phone_verified: !!validatedRegistration.phone,
        pin_set: false,
        registration_complete: false, // Will be set to true after PIN setup
      })

      if (profileError) {
        // Rollback auth user if profile creation fails
        try {
          const adminClient = createAdminClient()
          await adminClient.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Failed to rollback auth user:', deleteError)
        }
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        )
      }

      // Update OTP record with user_id
      await supabase
        .from('otp_codes')
        .update({ user_id: authData.user.id })
        .eq('id', otpRecord.id)

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

      // Return user data and session (user is created but PIN is not set yet)
      return NextResponse.json({
        message: 'OTP verified successfully. Please set up your PIN to complete registration.',
        user: {
          id: authData.user.id,
          email: validatedRegistration.email,
          ...(validatedRegistration.phone && { phone: validatedRegistration.phone }),
          full_name: validatedRegistration.full_name,
          pin_set: false, // PIN setup is the next step
        },
        session: authData.session,
        requires_pin_setup: true,
      })
    } else if (type === 'reset') {
      // Password reset flow - get user from identifier
      const { data: user } = await supabase
        .from('users')
        .select('id, email, phone')
        .or(`${email ? `email.eq.${email}` : ''}${email && phone ? ',' : ''}${phone ? `phone.eq.${phone}` : ''}`)
        .single()

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Mark OTP as verified
      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id)

      // Generate reset token (64 character hex string)
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token using SECURITY DEFINER function to bypass RLS
      // Use user.id as identifier to link the token to the user
      const { data: tokenIdData, error: tokenError } = await supabase.rpc(
        'insert_reset_token',
        {
          p_code: resetToken,
          p_type: 'reset_token',
          p_identifier: user.id.toString(), // Use user ID as identifier for reset token
          p_expires_at: expiresAt.toISOString(),
          p_user_id: user.id,
        }
      )

      if (tokenError) {
        console.error('Failed to store reset token:', tokenError)
        return NextResponse.json(
          { error: 'Failed to generate reset token' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'OTP verified successfully',
        reset_token: resetToken,
        expires_at: expiresAt.toISOString(),
      })
    } else if (type === 'login') {
      // Login OTP verification
      // This would typically use Supabase's phone OTP authentication
      return NextResponse.json({
        message: 'OTP verified successfully',
      })
    } else {
      // Generic verification
      return NextResponse.json({
        message: 'OTP verified successfully',
      })
    }
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
