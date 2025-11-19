import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendOTPviaEmail } from '@/app/lib/services/email'
import { sendOTPviaWhatsApp } from '@/app/lib/services/whatsapp'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

/**
 * Forgot Password API
 * Security: Always returns success to prevent user enumeration attacks
 * - Checks if user exists (silently)
 * - Only sends OTP if user exists
 * - Always returns success message regardless of user existence
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone } = body

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    // Rate limit by email/phone and IP (use both for better protection)
    const identifier = email || phone || ''
    const ip = getClientIdentifier(request)
    
    // Check rate limit by identifier (email/phone)
    const identifierLimit = checkRateLimit(
      `forgot-password:${identifier}`,
      RATE_LIMITS.AUTH_FORGOT_PASSWORD
    )
    
    // Check rate limit by IP
    const ipLimit = checkRateLimit(
      `forgot-password-ip:${ip}`,
      RATE_LIMITS.AUTH_FORGOT_PASSWORD
    )

    if (!identifierLimit.allowed) {
      const retryAfter = Math.ceil(
        (identifierLimit.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_FORGOT_PASSWORD.maxRequests.toString(),
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
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_FORGOT_PASSWORD.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const supabase = await createClient()

    // Check if user exists (silently - don't reveal if user exists or not)
    // Check only in public.users table - if user exists in system, they're in this table
    let userExists = false
    let userId: string | null = null
    let userEmail = email
    let userPhone = phone

    if (email) {
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, email, phone')
        .eq('email', email)
        .maybeSingle() // Use maybeSingle() instead of single() - returns null instead of error when no row found

      // User exists only if we have data and no error (or error is just "no rows found")
      userExists = !!dbUser && !userError
      
      console.log('[Forgot Password] Email check:', {
        email,
        userExists,
        hasData: !!dbUser,
        error: userError?.code,
        errorMessage: userError?.message,
      })

      if (userExists && dbUser) {
        userId = dbUser.id
        userEmail = dbUser.email || email
        userPhone = dbUser.phone || null
      }
    } else if (phone) {
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, phone, email')
        .eq('phone', phone)
        .maybeSingle() // Use maybeSingle() instead of single() - returns null instead of error when no row found

      // User exists only if we have data and no error
      userExists = !!dbUser && !userError
      
      console.log('[Forgot Password] Phone check:', {
        phone,
        userExists,
        hasData: !!dbUser,
        error: userError?.code,
        errorMessage: userError?.message,
      })

      if (userExists && dbUser) {
        userId = dbUser.id
        userPhone = dbUser.phone || phone
        userEmail = dbUser.email || null
      }
    }

    // Return error if user doesn't exist
    if (!userExists) {
      console.log('[Forgot Password] User does not exist:', identifier)
      return NextResponse.json(
        {
          error: 'Account does not exist',
        },
        { status: 404 }
      )
    }

    console.log('[Forgot Password] User exists - proceeding to send OTP:', {
      identifier,
      userEmail,
      userPhone,
    })

    // User exists - generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Store OTP in database with type='reset'
    // Use SECURITY DEFINER function to bypass RLS since user is not authenticated
    const { data: otpIdData, error: otpError } = await supabase.rpc(
      'insert_reset_otp',
      {
        p_code: otpCode,
        p_type: 'reset',
        p_identifier: identifier,
        p_expires_at: expiresAt.toISOString(),
        p_user_id: null, // Set to NULL for unauthenticated password reset flow
      }
    )

    if (otpError || !otpIdData) {
      console.error('Failed to store OTP:', otpError)
      return NextResponse.json(
        {
          error: 'Failed to generate reset code. Please try again.',
        },
        { status: 500 }
      )
    }

    // Create OTP data object with the ID returned from the function
    // We don't need to fetch it back since we have the ID
    const otpData = {
      id: otpIdData,
      code: otpCode,
      type: 'reset',
      identifier,
      user_id: null,
      expires_at: expiresAt.toISOString(),
      verified: false,
    }

    // Send OTP via appropriate channel
    let sendResult: { success: boolean; error?: string }

    if (userEmail) {
      // Send via Email
      console.log('[Forgot Password] Sending OTP via email to:', userEmail)
      sendResult = await sendOTPviaEmail(userEmail, otpCode)
      console.log('[Forgot Password] Email send result:', sendResult)
    } else if (userPhone) {
      // Send via WhatsApp
      console.log('[Forgot Password] Sending OTP via WhatsApp to:', userPhone)
      sendResult = await sendOTPviaWhatsApp(userPhone, otpCode)
      console.log('[Forgot Password] WhatsApp send result:', sendResult)
    } else {
      // This shouldn't happen if user exists, but handle gracefully
      console.error('[Forgot Password] User exists but no email or phone found:', { identifier, userExists })
      return NextResponse.json(
        {
          error: 'No contact method found for this account',
        },
        { status: 400 }
      )
    }

    // If sending fails, return error
    if (!sendResult.success) {
      console.error('Failed to send OTP:', sendResult.error)
      // Clean up OTP record if sending failed
      await supabase.from('otp_codes').delete().eq('id', otpData.id)
      
      return NextResponse.json(
        {
          error: sendResult.error || 'Failed to send reset code. Please try again.',
        },
        { status: 500 }
      )
    }

    // Return success with OTP ID (in development, include OTP for testing)
    const response: any = {
      message: 'Reset code has been sent successfully',
      otp_id: otpData.id,
      identifier,
      expires_in: 600, // 10 minutes in seconds
    }

    // In development, include OTP code for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      response.dev_otp = otpCode
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      {
        error: error.message || 'An error occurred. Please try again.',
      },
      { status: 500 }
    )
  }
}

