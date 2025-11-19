import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from './rate-limit'

/**
 * Rate limit middleware for API routes
 * Returns a middleware function that can be used in API route handlers
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<Response>,
  config: {
    identifier?: (request: T) => string | Promise<string> // Custom identifier extractor
    limitConfig: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]
    errorMessage?: string
  }
) {
  return async (request: T): Promise<Response> => {
    try {
      // Get identifier (default to IP, or use custom extractor)
      let identifier: string
      if (config.identifier) {
        identifier = await config.identifier(request)
      } else {
        identifier = getClientIdentifier(request as Request)
      }

      // Check rate limit
      const { allowed, remaining, resetTime } = checkRateLimit(
        identifier,
        config.limitConfig
      )

      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
        return NextResponse.json(
          {
            error:
              config.errorMessage ||
              'Too many requests. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.limitConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            },
          }
        )
      }

      // Add rate limit headers to response
      const response = await handler(request)
      
      // Clone response to add headers
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set(
        'X-RateLimit-Limit',
        config.limitConfig.maxRequests.toString()
      )
      responseHeaders.set('X-RateLimit-Remaining', remaining.toString())
      responseHeaders.set(
        'X-RateLimit-Reset',
        new Date(resetTime).toISOString()
      )

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // On error, allow the request (fail open for availability)
      return handler(request)
    }
  }
}

