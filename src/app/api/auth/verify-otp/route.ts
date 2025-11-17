import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { registerSchema } from '@/app/validation/auth'
import { REFERRAL_LEVELS } from '@/app/constants/projects'
import crypto from 'crypto'

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

    const supabase = await createClient()
    const identifier = email || phone || ''

    // Find and verify OTP
    let otpQuery = supabase
      .from('otp_codes')
      .select('*')
      .eq('identifier', identifier)
      .eq('type', type === 'register' ? 'register' : 'verification')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (otp_id) {
      otpQuery = otpQuery.eq('id', otp_id)
    }

    const { data: otpRecords, error: otpQueryError } = await otpQuery

    if (otpQueryError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    const otpRecord = otpRecords[0]

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP code
    if (otpRecord.code !== otp) {
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
          await supabase.auth.admin.deleteUser(authData.user.id)
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
      // Password reset flow
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in database (you might want to create a password_reset_tokens table)
      // For now, we'll return it
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
