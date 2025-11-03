import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
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

    // Login with email or phone
    let authResponse

    if (email) {
      authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } else {
      // For phone, Supabase requires phone authentication
      // You might need to adjust this based on your auth setup
      authResponse = await supabase.auth.signInWithPassword({
        phone,
        password,
      })
    }

    if (authResponse.error) {
      return NextResponse.json(
        { error: authResponse.error.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: authResponse.data.user?.id,
        email: authResponse.data.user?.email,
        phone: authResponse.data.user?.phone,
      },
      session: authResponse.data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

