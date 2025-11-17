import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

// Protected routes that require authentication
const protectedRoutes = [
  '/wallet',
  '/profile',
  '/referrals',
  '/marketplace',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
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

  // Check authentication for protected routes
  if (isProtectedRoute) {
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
    }
  }

  return response
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a file extension (e.g. `.jpg`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

