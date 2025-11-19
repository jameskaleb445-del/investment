/**
 * Simple in-memory rate limiter
 * Tracks requests by identifier (IP, email, phone, user_id, etc.)
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
}

interface RequestRecord {
  count: number
  resetTime: number
}

// In-memory store: identifier -> RequestRecord
const requestStore = new Map<string, RequestRecord>()

// Cleanup interval to remove old entries (every 5 minutes)
// Only run cleanup in Node.js environment (not in edge runtime)
if (typeof process !== 'undefined' && process.env) {
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now()
      for (const [key, record] of requestStore.entries()) {
        if (record.resetTime < now) {
          requestStore.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP, email, phone, user_id, etc.)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requestStore.get(identifier)

  // If no record exists or window has expired, create new record
  if (!record || record.resetTime < now) {
    const newRecord: RequestRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    requestStore.set(identifier, newRecord)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime,
    }
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment count
  record.count++
  requestStore.set(identifier, record)

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  let ip = cfConnectingIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown'

  return ip
}

/**
 * Rate limit presets for common use cases
 */
export const RATE_LIMITS = {
  // Auth endpoints - stricter limits
  AUTH_FORGOT_PASSWORD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
  },
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
  },
  AUTH_VERIFY_OTP: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 OTP verifications per 15 minutes
  },
  AUTH_RESET_PASSWORD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 password resets per hour
  },
  // General API endpoints
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
} as const

