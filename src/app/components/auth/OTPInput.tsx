'use client'

import { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error,
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleChange = (index: number, newValue: string) => {
    // Only allow numbers
    if (newValue && !/^\d+$/.test(newValue)) {
      return
    }

    const newOTP = value.split('')
    
    if (newValue.length > 1) {
      // Handle paste
      const digits = newValue.slice(0, length).split('')
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOTP[index + i] = digit
        }
      })
    } else {
      newOTP[index] = newValue
    }

    const updatedOTP = newOTP.slice(0, length).join('')
    onChange(updatedOTP)

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (digits.length > 0) {
      onChange(digits)
      const nextIndex = Math.min(digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            className={`
              w-12 h-12 sm:w-14 sm:h-14
              text-center text-xl sm:text-2xl font-bold
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:bg-[#2d2d35] disabled:cursor-not-allowed
              bg-[#2d2d35] text-white
              ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : focusedIndex === index
                  ? 'border-[#8b5cf6] focus:ring-[#8b5cf6]'
                  : 'border-[#3a3a44] focus:border-[#8b5cf6]'
              }
            `}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}

