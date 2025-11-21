import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminClient } from '@/app/lib/supabase/admin'

/**
 * Reset PIN via Email Verification
 * - User must be authenticated
 * - Sends reset code to user's email
 * - User enters code and new PIN
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, code, newPin } = body

    if (action === 'request') {
      // Step 1: Request PIN reset
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Verify email matches authenticated user
      if (user.email !== email) {
        return NextResponse.json(
          { error: 'Email does not match your account' },
          { status: 400 }
        )
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store reset code in user metadata with expiration (15 minutes)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)

      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          pin_reset_code: resetCode,
          pin_reset_expires_at: expiresAt.toISOString(),
        },
      })

      // Send email with reset code
      const { sendPINResetCode } = await import('@/app/lib/services/email')
      const emailResult = await sendPINResetCode(email, resetCode)
      
      if (!emailResult.success) {
        console.error('Failed to send PIN reset email:', emailResult.error)
        // Still continue - code is generated and stored
      }

      // Store reset code temporarily for development
      const resetData: any = {
        message: 'PIN reset code sent to your email',
      }
      
      // In development, return code (remove in production)
      if (process.env.NODE_ENV === 'development') {
        resetData.code = resetCode
      }

      return NextResponse.json(resetData)
    }

    if (action === 'verify') {
      // Step 2: Verify code and set new PIN
      if (!code || !newPin) {
        return NextResponse.json(
          { error: 'Reset code and new PIN are required' },
          { status: 400 }
        )
      }

      // Validate PIN format
      if (!/^\d{4}$/.test(newPin)) {
        return NextResponse.json(
          { error: 'PIN must be 4 digits' },
          { status: 400 }
        )
      }

      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check reset code
      const storedCode = user.user_metadata?.pin_reset_code
      const expiresAt = user.user_metadata?.pin_reset_expires_at

      if (!storedCode || !expiresAt) {
        return NextResponse.json(
          { error: 'No PIN reset request found. Please request a reset first.' },
          { status: 400 }
        )
      }

      // Check if code is expired
      if (new Date(expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Reset code has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      // Verify code
      if (code !== storedCode) {
        return NextResponse.json(
          { error: 'Incorrect reset code. Please check and try again.' },
          { status: 401 }
        )
      }

      // Hash new PIN
      const hashedPin = crypto
        .createHash('sha256')
        .update(newPin)
        .digest('hex')

      // Update PIN hash and clear reset code
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          pin_hash: hashedPin,
          pin_reset_code: null,
          pin_reset_expires_at: null,
        },
      })

      // Update users table
      await supabase
        .from('users')
        .update({ pin_set: true })
        .eq('id', user.id)

      return NextResponse.json({
        message: 'PIN reset successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "request" or "verify".' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('PIN reset error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset PIN' },
      { status: 500 }
    )
  }
}

