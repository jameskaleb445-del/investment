import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/app/lib/rate-limit'

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

    // Rate limit by email/phone and IP
    const identifier = email || phone || ''
    const ip = getClientIdentifier(request)

    const identifierLimit = checkRateLimit(
      `login:${identifier}`,
      RATE_LIMITS.AUTH_LOGIN
    )

    const ipLimit = checkRateLimit(
      `login-ip:${ip}`,
      RATE_LIMITS.AUTH_LOGIN
    )

    if (!identifierLimit.allowed) {
      const retryAfter = Math.ceil(
        (identifierLimit.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_LOGIN.maxRequests.toString(),
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
            'X-RateLimit-Limit': RATE_LIMITS.AUTH_LOGIN.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipLimit.resetTime).toISOString(),
          },
        }
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

