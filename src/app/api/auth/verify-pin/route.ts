import { createClient } from '@/app/lib/supabase/server'
import { pinSchema } from '@/app/validation/auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = pinSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hash provided PIN
    const hashedPin = crypto
      .createHash('sha256')
      .update(validated.pin)
      .digest('hex')

    // Get stored PIN hash from user metadata
    const storedPinHash = user.user_metadata?.pin_hash

    if (!storedPinHash) {
      return NextResponse.json(
        { error: 'PIN not set. Please setup your PIN first.' },
        { status: 400 }
      )
    }

    if (hashedPin !== storedPinHash) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'PIN verified successfully',
      verified: true,
    })
  } catch (error: any) {
    if (error.issues) {
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

