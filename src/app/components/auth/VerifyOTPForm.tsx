'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { OTPInput } from './OTPInput'
import toast from 'react-hot-toast'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'

interface VerifyOTPFormProps {
  email?: string
  phone?: string
  type?: 'reset' | 'login' | 'register'
}

export function VerifyOTPForm({ email, phone, type = 'reset' }: VerifyOTPFormProps) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Trigger top loading bar when loading
  useTopLoadingBar(loading || resendLoading)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, otp, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      toast.success('Code verified successfully!')

      if (type === 'reset') {
        router.push(`/reset-password?token=${data.token}`)
      } else if (type === 'login') {
        router.push('/')
        router.refresh()
      } else {
        router.push('/login')
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      toast.success('Code resent successfully!')
      setOtp('')
      setCountdown(60)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  const title = type === 'reset' ? 'Reset Password' : type === 'login' ? 'Verify Login' : 'Verify Account'
  const identifier = email || phone || 'your email'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-[#a0a0a8] text-sm sm:text-base">
          We've sent a 6-digit verification code to {identifier}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-center block">Enter Verification Code</Label>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
            error={error}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-[#a0a0a8] mb-2">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-[#6b7280]">
              Resend code in {countdown}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-[#8b5cf6] hover:text-[#7c3aed] font-semibold disabled:opacity-50 cursor-pointer"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || otp.length !== 6}
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </Button>
    </form>
  )
}

