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

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [identifier, setIdentifier] = useState('') // email or phone
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: identifier.includes('@') ? identifier : undefined,
          phone: identifier.includes('@') ? undefined : identifier,
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center sm:text-left">
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
            inputMode={identifier.includes('@') ? 'email' : 'tel'}
            autoComplete={identifier.includes('@') ? 'email' : 'tel'}
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
        disabled={loading}
      >
        {loading ? t('signingIn') : t('signIn')}
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
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FaApple className="w-5 h-5" />
          <span className="font-medium">Apple</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">Google</span>
        </button>
      </div>
    </form>
  )
}
