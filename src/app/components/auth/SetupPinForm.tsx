'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/button'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'

export function SetupPinForm() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmPinInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useTopLoadingBar(loading)

  useEffect(() => {
    pinInputRefs.current[0]?.focus()
  }, [])

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

  const handlePaste = (e: React.ClipboardEvent, isConfirm = false) => {
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
      const response = await fetch('/api/auth/setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('failedToSetupPin'))
      }

      // Redirect to home after successful PIN setup
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || t('failedToSetupPin'))
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header with Icon */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-[#8b5cf6]/20 rounded-full">
              <Lock className="w-8 h-8 text-[#8b5cf6]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3 text-white">
              {t('setupPin')}
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
                  onPaste={(e) => handlePaste(e, false)}
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
                  onPaste={(e) => handlePaste(e, true)}
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
          {loading ? t('settingUp') : t('completeSetup')}
        </Button>

        {/* Security Note */}
        <p className="text-center text-xs text-[#a0a0a8] px-4">
          {t('pinSecurityNote')}
        </p>
      </form>
    </div>
  )
}

