'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from '@/i18n/navigation'
import { Button } from '../ui/button'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'
import { Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export function ResetPinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
  const [step, setStep] = useState<'code' | 'pin'>('code')
  const [resetCode, setResetCode] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestingCode, setRequestingCode] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmPinInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useTopLoadingBar(loading || requestingCode)

  useEffect(() => {
    // Check if user is authenticated and get email
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserEmail(data.email || '')
        }
      } catch (error) {
        console.error('Failed to fetch user email:', error)
      }
    }
    fetchUserEmail()

    // Check if we have email in query params
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setUserEmail(emailParam)
      setStep('code') // Start with code entry if email is provided
    }
  }, [searchParams])

  useEffect(() => {
    if (step === 'code') {
      codeInputRefs.current[0]?.focus()
    } else {
      pinInputRefs.current[0]?.focus()
    }
  }, [step])

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return

    const newCode = resetCode.split('')
    newCode[index] = value
    const updatedCode = newCode.slice(0, 6).join('')
    setResetCode(updatedCode)

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setResetCode(pasted)
    if (pasted.length === 6) {
      codeInputRefs.current[5]?.focus()
    } else if (pasted.length > 0) {
      codeInputRefs.current[pasted.length - 1]?.focus()
    }
  }

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value && !/^\d$/.test(value)) return

    const refs = isConfirm ? confirmPinInputRefs : pinInputRefs
    const currentPin = isConfirm ? confirmPin : pin
    const newPin = currentPin.split('')
    newPin[index] = value

    const updatedPin = newPin.slice(0, 4).join('')
    if (isConfirm) {
      setConfirmPin(updatedPin)
    } else {
      setPin(updatedPin)
    }

    if (value && index < 3) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePinPaste = (e: React.ClipboardEvent, isConfirm = false) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (isConfirm) {
      setConfirmPin(pasted)
      if (pasted.length === 4) {
        confirmPinInputRefs.current[3]?.focus()
      } else if (pasted.length > 0) {
        confirmPinInputRefs.current[pasted.length - 1]?.focus()
      }
    } else {
      setPin(pasted)
      if (pasted.length === 4) {
        pinInputRefs.current[3]?.focus()
      } else if (pasted.length > 0) {
        pinInputRefs.current[pasted.length - 1]?.focus()
      }
    }
  }

  const handleRequestCode = async () => {
    if (!userEmail) {
      toast.error('Please provide your email address')
      return
    }

    setRequestingCode(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: userEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('pinResetRequestFailed'))
      }

      toast.success(t('pinResetCodeSent'))
      // In development, show code in console
      if (process.env.NODE_ENV === 'development' && data.code) {
        console.log('PIN Reset Code:', data.code)
        toast(`Reset code: ${data.code} (dev only)`, { duration: 6000 })
      }
    } catch (err: any) {
      setError(err.message || t('pinResetRequestFailed'))
      toast.error(err.message || t('pinResetRequestFailed'))
    } finally {
      setRequestingCode(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (resetCode.length !== 6) {
      setError('Please enter the 6-digit reset code')
      return
    }

    setStep('pin')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 4) {
      setError(t('pinMustBe4Digits'))
      return
    }

    if (pin !== confirmPin) {
      setError(t('pinsDoNotMatch'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          code: resetCode,
          newPin: pin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset PIN')
      }

      toast.success(t('pinResetSuccess') || 'PIN reset successfully!')
      // Redirect to home after successful PIN reset
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset PIN')
      toast.error(err.message || 'Failed to reset PIN')
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleVerifyCode} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-[#8b5cf6]/20 rounded-full">
                <Mail className="w-8 h-8 text-[#8b5cf6]" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3 text-white">
                {t('resetPinTitle') || 'Reset Your PIN'}
              </h2>
              <p className="text-[#a0a0a8] text-base">
                {t('resetPinDescription') || 'Enter the 6-digit code sent to your email'}
              </p>
            </div>
          </div>

          {/* Email Display */}
          {userEmail && (
            <div className="text-center">
              <p className="text-sm text-[#a0a0a8]">
                {t('codeSentTo') || 'Code sent to'}: <span className="text-white font-medium">{userEmail}</span>
              </p>
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={requestingCode}
                className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] underline mt-2"
              >
                {requestingCode ? t('sendingCode') : t('resendCode')}
              </button>
            </div>
          )}

          {/* Reset Code Input */}
          <div className="space-y-4">
            <label className="block text-center text-sm font-medium text-[#a0a0a8]">
              {t('enterResetCode') || 'Enter Reset Code'}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    codeInputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={resetCode[index] || ''}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onPaste={handleCodePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
                      codeInputRefs.current[index - 1]?.focus()
                    }
                  }}
                  className="
                    w-12 h-12 sm:w-14 sm:h-14
                    text-center text-xl sm:text-2xl font-bold
                    border-2 rounded-xl
                    bg-[#2d2d35] text-white
                    border-[#3a3a44]
                    focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/20
                    focus:outline-none
                    transition-all duration-200
                    hover:border-[#8b5cf6]/50
                  "
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={resetCode.length !== 6}
          >
            {t('verifyCode') || 'Verify Code'}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-[#a0a0a8] hover:text-white"
            >
              {t('backToLogin') || 'Back to Login'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Step 2: New PIN
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-[#8b5cf6]/20 rounded-full">
              <Lock className="w-8 h-8 text-[#8b5cf6]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3 text-white">
              {t('createNewPin') || 'Create New PIN'}
            </h2>
            <p className="text-[#a0a0a8] text-base">
              {t('setupPinDescription')}
            </p>
          </div>
        </div>

        {/* PIN Input Sections */}
        <div className="space-y-8">
          {/* Enter PIN */}
          <div className="space-y-4">
            <label className="block text-center text-sm font-medium text-[#a0a0a8]">
              {t('enterPin')}
            </label>
            <div className="flex justify-center gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    pinInputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index] || ''}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onPaste={(e) => handlePinPaste(e, false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !pin[index] && index > 0) {
                      pinInputRefs.current[index - 1]?.focus()
                    }
                  }}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20
                    text-center text-2xl sm:text-3xl font-bold
                    border-2 rounded-xl
                    bg-[#2d2d35] text-white
                    border-[#3a3a44]
                    focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/20
                    focus:outline-none
                    transition-all duration-200
                    hover:border-[#8b5cf6]/50
                    ${error && pin.length === 4 ? 'border-red-500' : ''}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Confirm PIN */}
          <div className="space-y-4">
            <label className="block text-center text-sm font-medium text-[#a0a0a8]">
              {t('confirmPin')}
            </label>
            <div className="flex justify-center gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    confirmPinInputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={confirmPin[index] || ''}
                  onChange={(e) => handlePinChange(index, e.target.value, true)}
                  onPaste={(e) => handlePinPaste(e, true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !confirmPin[index] && index > 0) {
                      confirmPinInputRefs.current[index - 1]?.focus()
                    }
                  }}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20
                    text-center text-2xl sm:text-3xl font-bold
                    border-2 rounded-xl
                    bg-[#2d2d35] text-white
                    border-[#3a3a44]
                    focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/20
                    focus:outline-none
                    transition-all duration-200
                    hover:border-[#8b5cf6]/50
                    ${error && confirmPin.length === 4 && pin !== confirmPin ? 'border-red-500' : ''}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
        >
          {loading ? t('resettingPin') || 'Resetting...' : t('resetPin') || 'Reset PIN'}
        </Button>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('code')}
            className="text-sm text-[#a0a0a8] hover:text-white"
          >
            {t('back') || 'Back'}
          </button>
        </div>
      </form>
    </div>
  )
}

