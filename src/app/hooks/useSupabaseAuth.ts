'use client'

import { useCallback, useState } from 'react'
import {
  signInWithGoogle,
  signInWithIdentifier,
  signUpWithProfile,
} from '@/app/lib/supabase/authClient'

type LoginArgs = {
  identifier: string
  password: string
}

type RegisterArgs = {
  email: string
  password: string
  fullName: string
  phone?: string
  referralCode?: string
}

export function useSupabaseAuth() {
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const login = useCallback(async ({ identifier, password }: LoginArgs) => {
    setLoginLoading(true)
    try {
      if (!identifier || !password) {
        throw new Error('Identifier and password are required')
      }
      return await signInWithIdentifier({ identifier, password })
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const register = useCallback(
    async ({ email, password, fullName, phone, referralCode }: RegisterArgs) => {
      setRegisterLoading(true)
      try {
        if (!email) {
          throw new Error('Email is required')
        }
        if (!password) {
          throw new Error('Password is required')
        }
        return await signUpWithProfile({
          email,
          password,
          fullName,
          phone,
          referralCode,
        })
      } finally {
        setRegisterLoading(false)
      }
    },
    []
  )

  const loginWithGoogle = useCallback(async (referralCode?: string) => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle(referralCode)
    } finally {
      setGoogleLoading(false)
    }
  }, [])

  return {
    login,
    register,
    loginLoading,
    registerLoading,
    googleLoading,
    loginWithGoogle,
  }
}


