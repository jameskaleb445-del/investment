import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

// Protected routes that require authentication
const protectedRoutes = [
  '/', // Homepage
  '/wallet',
  '/profile',
  '/referrals',
  '/marketplace',
  '/notifications',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/setup-pin', // Allow access to PIN setup for new OAuth users
  '/reset-pin', // Allow access to PIN reset
]

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  // First, handle internationalization
  const response = intlMiddleware(request)

  // Extract the pathname without locale
  const pathname = request.nextUrl.pathname
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/'

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Skip auth check for public routes and API routes
  if (isPublicRoute || pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    return response
  }

  // All other routes require authentication (default deny)
  // This protects all routes except public auth pages and API routes
  try {
    // Create Supabase client for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user and trying to access protected route, redirect to login
    if (!user) {
      const locale = pathname.split('/')[1] || defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // If Supabase is not configured, allow access (for development)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return response
    }
    // Otherwise, redirect to login on error
    const locale = pathname.split('/')[1] || defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {

  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],

}

