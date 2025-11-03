import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

// Paths that should bypass locale routing (PWA files, etc.)
const publicPaths = [
  '/manifest.json',
  '/sw.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bypass locale routing for PWA files and other public assets
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Handle i18n routing for all other paths
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

