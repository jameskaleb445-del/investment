'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import toast from 'react-hot-toast'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'

export function ForgotPasswordForm() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code')
      }

      toast.success(data.message || t('codeResent'))
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{t('forgotPasswordTitle')}</h2>
        <p className="text-[#a0a0a8] text-sm sm:text-base">
          {t('forgotPasswordDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('emailOrPhone')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder={t('emailOrPhonePlaceholder')}
            inputMode="email"
            autoComplete="email"
            required
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
        {loading ? t('sendingCode') : t('sendCode')}
      </Button>
    </form>
  )
}

