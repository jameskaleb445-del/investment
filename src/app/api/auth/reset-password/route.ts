import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    const supabase = await createClient()

    // In production, verify the token from your database
    // For now, this is a simplified version
    // You would check if the token exists and is not expired

    // If using Supabase password reset flow, you would update password via session
    // For OTP-based reset, you would:
    // 1. Verify token is valid and not expired
    // 2. Get user associated with token
    // 3. Update user password in Supabase auth
    // 4. Delete the used token

    // This is a placeholder - in production, implement proper token verification
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to reset password' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

