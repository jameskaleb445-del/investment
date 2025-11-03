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

    // Hash PIN (in production, use bcrypt or similar)
    const hashedPin = crypto
      .createHash('sha256')
      .update(validated.pin)
      .digest('hex')

    // Store PIN hash in user metadata or separate table
    // For now, we'll store it in user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { pin_hash: hashedPin },
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'PIN setup successfully',
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

