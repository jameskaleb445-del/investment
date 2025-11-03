import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export async function proxy(request: NextRequest) {
  // Handle i18n routing first
  const intlResponse = intlMiddleware(request)
  
  if (intlResponse) {
    return intlResponse
  }
  
  // Basic proxy function - passes through requests
  // TODO: Add Supabase authentication logic here when ready
  
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - font files (woff2, woff, ttf, otf)
     * - static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|otf|eot)$).*)',
  ],
}

