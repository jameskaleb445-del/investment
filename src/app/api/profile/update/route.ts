import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, phone } = body

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user profile in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: full_name || null,
        phone: phone || null,
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update profile' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

