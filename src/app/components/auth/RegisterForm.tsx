'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Link } from '@/i18n/navigation'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { Button } from '../ui'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'
import { createClient } from '@/app/lib/supabase/client'
import toast from 'react-hot-toast'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    referral_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  // Get referral code from URL parameter (?ref=...)
  useEffect(() => {
    const refCode = searchParams?.get('ref')
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        referral_code: refCode.toUpperCase(),
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // If requires_login is true, redirect to login
      if (data.requires_login) {
        toast.success(data.message || 'Account created successfully! Please login.')
        router.push('/login')
        return
      }

      // Sign in the user to establish session
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        // User created but sign in failed - redirect to login
        toast.success('Account created successfully! Please login.')
        router.push('/login')
        return
      }

      // Success - redirect to setup PIN page
      toast.success(t('registrationSuccess') || 'Account created successfully!')
      router.push('/setup-pin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-10">
      <div className="text- sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{t('createAccount')}</h2>
        <p className="text-[#a0a0a8] text-sm sm:text-base">
          {t('getStarted')}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t('fullName')}</Label>
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => {
              setFormData({ ...formData, full_name: e.target.value })
              setError('')
            }}
            placeholder={t('fullNamePlaceholder')}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              setError('')
            }}
            placeholder={t('emailPlaceholder')}
            inputMode="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setError('')
              }}
              placeholder={t('passwordPlaceholder')}
              autoComplete="new-password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a8] hover:text-white transition-colors"
            >
              {showPassword ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referral_code">{t('referralCode')}</Label>
          <Input
            id="referral_code"
            type="text"
            value={formData.referral_code}
            onChange={(e) =>
              setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })
            }
            placeholder={t('referralCodePlaceholder')}
          />
        </div>
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? t('creatingAccount') : t('signUp')}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3a3a44]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#1a1a1f] text-[#a0a0a8]">{t('orSignUpWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FaApple className="w-5 h-5" />
          <span className="font-medium">Apple</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              const { signInWithGoogle } = await import('@/app/lib/supabase/authClient')
              await signInWithGoogle(formData.referral_code || undefined)
            } catch (error: any) {
              setError(error.message || 'Failed to sign in with Google')
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">Google</span>
        </button>
      </div>
    </form>
  )
}

