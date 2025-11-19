import { NextResponse } from 'next/server'

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key for push notification subscription
 * 
 * Note: In production, generate VAPID keys using:
 * npx web-push generate-vapid-keys
 * Store the keys in environment variables
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  if (!publicKey) {
    return NextResponse.json(
      { error: 'VAPID public key not configured. Please generate VAPID keys using: npx web-push generate-vapid-keys' },
      { status: 503 } // Service Unavailable - feature not configured
    )
  }

  return NextResponse.json({ publicKey })
}

