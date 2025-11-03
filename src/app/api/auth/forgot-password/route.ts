import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    const supabase = await createClient()

    // Generate OTP code (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database (you'll need an otp_codes table)
    // For now, we'll use Supabase auth password reset
    let authResponse

    if (email) {
      // Use Supabase password reset which sends an email
      authResponse = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      })

      // For OTP flow, you would store the OTP in a table and send via SMS
      // This is a simplified version
      return NextResponse.json({
        message: 'Password reset email sent',
        // In production, you would store OTP and return success without the code
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      })
    } else {
      // For phone, you would send OTP via SMS
      // This is a placeholder - you'll need to integrate with SMS service
      return NextResponse.json({
        message: 'OTP code sent to your phone',
        // In production, send via SMS and don't return the code
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      })
    }

    if (authResponse?.error) {
      return NextResponse.json(
        { error: authResponse.error.message || 'Failed to send reset code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Reset code sent successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

