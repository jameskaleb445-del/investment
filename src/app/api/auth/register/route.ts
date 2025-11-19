import { createClient } from '@/app/lib/supabase/server'
import { registerSchema } from '@/app/validation/auth'
import { NextResponse } from 'next/server'
import { sendOTPviaEmail } from '@/app/lib/services/email'
import { sendOTPviaWhatsApp } from '@/app/lib/services/whatsapp'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

/**
 * Step 1: Registration Initiation
 * - Validates registration data
 * - Generates 6-digit OTP
 * - Sends OTP via WhatsApp (for phone) or Email (for email)
 * - Stores OTP in database with expiration (10 minutes)
 * - Returns success message (does NOT create user yet)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Rate limit by email/phone and IP
    const identifier = validated.email || validated.phone || ''
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

    // Check if user already exists
    if (validated.email) {
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
    }

    if (validated.phone) {
      const { data: existingPhoneUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', validated.phone)
        .single()

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 400 }
        )
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Store registration data and OTP temporarily
    // We'll store it in otp_codes table with identifier (email/phone) instead of user_id
    // (identifier is already defined above for rate limiting)

    // Store OTP in database (without user_id since user doesn't exist yet)
    // Store referral_code if provided for use during verification
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        code: otpCode,
        type: 'register',
        identifier,
        referral_code: validated.referral_code || null,
        expires_at: expiresAt.toISOString(),
        verified: false,
      })
      .select()
      .single()

    if (otpError) {
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      )
    }

    // Send OTP via appropriate channel
    let sendResult: { success: boolean; error?: string }

    if (validated.email) {
      // Send via Email
      sendResult = await sendOTPviaEmail(validated.email, otpCode)
    } else if (validated.phone) {
      // Send via WhatsApp
      sendResult = await sendOTPviaWhatsApp(validated.phone, otpCode)
    } else {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    if (!sendResult.success) {
      // Clean up OTP record if sending failed
      await supabase.from('otp_codes').delete().eq('id', otpData.id)
      return NextResponse.json(
        {
          error:
            sendResult.error || 'Failed to send verification code. Please try again.',
        },
        { status: 500 }
      )
    }

    // Return success with OTP ID for verification (in development, you might include OTP for testing)
    const response: any = {
      message: 'Verification code sent successfully',
      otp_id: otpData.id,
      identifier: identifier, // Return for verification step
      expires_in: 600, // 10 minutes in seconds
    }

    // In development, include OTP code for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      response.dev_otp = otpCode
    }

    return NextResponse.json(response)
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
