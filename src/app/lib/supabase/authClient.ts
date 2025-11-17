'use client'

import { createClient } from './client'
import { defaultLocale } from '@/i18n/config'

type IdentifierLoginPayload = {
  identifier: string
  password: string
}

type RegisterPayload = {
  email: string
  password: string
  fullName: string
  phone?: string
  referralCode?: string
}

function getCurrentLocale(): string {
  if (typeof window === 'undefined') return defaultLocale
  const pathname = window.location.pathname
  const localeMatch = pathname.match(/^\/(en|fr)(\/|$)/)
  return localeMatch ? localeMatch[1] : defaultLocale
}

 export async function signInWithGoogle(referralCode?: string) {
  const supabase = createClient()
  const locale = getCurrentLocale()

  // Build redirect URL with locale and referral code if provided
  let redirectTo = `${window.location.origin}/api/auth/callback?locale=${locale}`
  if (referralCode) {
    redirectTo += `&ref=${encodeURIComponent(referralCode)}`
  }

  // Store referral code in metadata if provided
  const queryParams: Record<string, string> = {
    access_type: 'offline',
    prompt: 'consent',
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams,
      ...(referralCode ? {
        data: {
          referral_code: referralCode,
        },
      } : {}),
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithIdentifier({ identifier, password }: IdentifierLoginPayload) {
  const supabase = createClient()

  const payload = identifier.includes('@')
    ? { email: identifier, password }
    : { phone: identifier, password }

  const { data, error } = await supabase.auth.signInWithPassword(payload as {
    email?: string
    phone?: string
    password: string
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = createClient()
  const locale = getCurrentLocale()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithProfile({ email, password, fullName, phone, referralCode }: RegisterPayload) {
  return signUpWithEmail(email, password, {
    full_name: fullName,
    ...(phone ? { phone } : {}),
    ...(referralCode ? { referral_code: referralCode } : {}),
  })
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getCurrentSession() {
  const supabase = createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}


