import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

/**
 * Reset Password API
 * - Verifies reset token is valid and not expired
 * - Gets user associated with token
 * - Updates user password in Supabase auth
 * - Deletes/invalidates the used token
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Rate limit by token and IP
    const ip = getClientIdentifier(request)

    const tokenLimit = checkRateLimit(
      `reset-password:${token}`,
      RATE_LIMITS.AUTH_RESET_PASSWORD
    )

    const ipLimit = checkRateLimit(
      `reset-password-ip:${ip}`,
      RATE_LIMITS.AUTH_RESET_PASSWORD
    )

    if (!tokenLimit.allowed) {
      const retryAfter = Math.ceil(
        (tokenLimit.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: 'Too many password reset attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_RESET_PASSWORD.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(tokenLimit.resetTime).toISOString(),
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
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_RESET_PASSWORD.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const supabase = await createClient()

    // Verify reset token from database
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('code', token)
      .eq('type', 'reset_token')
      .eq('verified', false)
      .single()

    if (tokenError) {
      console.error('[Reset Password] Token query error:', tokenError)
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (!tokenRecord) {
      console.error('[Reset Password] Token not found:', { token, tokenError })
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    console.log('[Reset Password] Token found:', {
      id: tokenRecord.id,
      expires_at: tokenRecord.expires_at,
      now: new Date().toISOString(),
      expired: new Date(tokenRecord.expires_at) < new Date(),
    })

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Get user from token
    if (!tokenRecord.user_id) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Use admin client to update password (requires service role)
    // For now, we'll use a workaround: sign in as the user temporarily to update password
    // In production, you might want to use Supabase admin API or a custom function
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', tokenRecord.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Use Supabase admin client to update password
    // This requires service role key to bypass RLS and update user password
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: password }
    )

    if (updateError) {
      console.error('Failed to update password:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      )
    }

    // Mark token as verified/used
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', tokenRecord.id)

    return NextResponse.json({
      message: 'Password reset successfully. You can now login with your new password.',
    })
  } catch (error: any) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

