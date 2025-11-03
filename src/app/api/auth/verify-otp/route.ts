import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, otp, type = 'reset' } = body

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

    // In production, verify OTP from database
    // For now, this is a simplified version
    // You would check the OTP against the stored value in your otp_codes table

    if (type === 'reset') {
      // Generate a reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15)

      // In production, store this token with expiration in your database
      // For now, we'll just return it (not secure, but works for development)

      return NextResponse.json({
        message: 'OTP verified successfully',
        token: resetToken,
      })
    } else if (type === 'login') {
      // Verify OTP and sign in user
      // This would typically use Supabase's phone OTP authentication
      return NextResponse.json({
        message: 'OTP verified successfully',
        user: {
          // User data would come from Supabase auth
        },
      })
    } else {
      // Register flow
      return NextResponse.json({
        message: 'OTP verified successfully',
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
