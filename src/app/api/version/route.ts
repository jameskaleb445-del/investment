import { NextResponse } from 'next/server'

// Get version from build time or generate one
const APP_VERSION = process.env.NEXT_PUBLIC_BUILD_TIME || Date.now().toString()

export async function GET() {
  return NextResponse.json({ version: APP_VERSION })
}

