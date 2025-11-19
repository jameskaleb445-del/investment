'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Link } from '@/i18n/navigation'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { Checkbox } from '../ui/checkbox'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth'
import toast from 'react-hot-toast'

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations('auth')
  const { login, loginLoading, googleLoading, loginWithGoogle } = useSupabaseAuth()
  const [identifier, setIdentifier] = useState('') // email or phone
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Determine input mode based on identifier content
  const getInputMode = () => {
    if (identifier.includes('@')) return 'email'
    // If starts with + or only numbers, treat as phone
    if (identifier.match(/^\+?\d+$/)) return 'tel'
    // Default to email keyboard (has @ symbol) when empty or mixed
    return 'email'
  }

  // Trigger top loading bar when loading
  useTopLoadingBar(loginLoading || googleLoading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login({ identifier, password })
      toast.success(t('loginSuccess'))
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-start sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{t('welcomeBack')}</h2>
        <p className="text-[#a0a0a8] text-sm sm:text-base">
          {t('signInToAccount')}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">{t('emailOrPhone')}</Label>
          <Input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value)
              setError('')
            }}
            placeholder={t('emailOrPhonePlaceholder')}
            inputMode={getInputMode()}
            autoComplete={identifier.includes('@') ? 'email' : identifier.match(/^\+?\d+$/) ? 'tel' : 'off'}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a8] hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal cursor-pointer"
          >
            {t('rememberMe')}
          </Label>
        </div>
        <Link 
          href="/forgot-password"
          className="text-sm text-[#8b5cf6] hover:text-[#7c3aed] font-medium cursor-pointer"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        size="lg"
        disabled={loginLoading}
      >
        {loginLoading ? t('signingIn') : t('signIn')}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3a3a44]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#1a1a1f] text-[#a0a0a8]">{t('orSignInWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={googleLoading}
        >
          <FaApple className="w-5 h-5" />
          <span className="font-medium">Apple</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            setError('')
            try {
              await loginWithGoogle()
              toast.success(t('loginSuccess'))
            } catch (err: any) {
              setError(err.message || 'Failed to sign in with Google')
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={googleLoading}
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">{googleLoading ? t('signingIn') : 'Google'}</span>
        </button>
      </div>
    </form>
  )
}
