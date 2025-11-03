'use client'

import { useState } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { PAYMENT_METHODS, MIN_WITHDRAWAL_AMOUNT, MAX_WITHDRAWAL_AMOUNT, PLATFORM_FEES } from '@/app/constants/projects'
import { withdrawalSchema } from '@/app/validation/wallet'
import { HiArrowUp, HiCheckCircle, HiEye, HiEyeOff, HiStar } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

interface WithdrawalBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  onSuccess?: () => void
}

export function WithdrawalBottomSheet({ 
  isOpen, 
  onClose, 
  availableBalance,
  onSuccess 
}: WithdrawalBottomSheetProps) {
  const t = useTranslations('wallet')
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  // Set default payment method on mount
  const [selectedMethod, setSelectedMethod] = useState<'orange_money' | 'mtn_mobile_money'>(PAYMENT_METHODS.ORANGE_MONEY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.ORANGE_MONEY,
      name: 'Orange Money',
      icon: 'https://freelogopng.com/images/all_img/1683000849orange-telecom-logo.png',
      color: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      isDefault: true,
    },
    {
      id: PAYMENT_METHODS.MTN_MOBILE_MONEY,
      name: 'MTN Mobile Money',
      icon: 'https://telecoms-channel.co.za/wp-content/uploads/2023/06/MTN_2022_Logo_Yellow_CMYK-removebg-preview.png',
      color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      isDefault: false,
    },
  ]

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')
    setAmount(numericValue)
    if (errors.amount) {
      setErrors({ ...errors, amount: '' })
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (errors.phone) {
      setErrors({ ...errors, phone: '' })
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow 4 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4)
    setPin(numericValue)
    if (errors.pin) {
      setErrors({ ...errors, pin: '' })
    }
  }

  const calculateFee = (amountValue: number) => {
    return amountValue * PLATFORM_FEES.WITHDRAWAL
  }

  const netAmount = amount ? Number(amount) - calculateFee(Number(amount)) : 0
  const totalWithFee = amount ? Number(amount) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Payment method is already selected by default, but check anyway
    if (!selectedMethod) {
      setErrors({ payment_method: t('pleaseSelectPaymentMethod', { defaultValue: 'Please select a payment method' }) })
      return
    }

    if (Number(amount) > availableBalance) {
      setErrors({ amount: t('insufficientBalance', { defaultValue: 'Insufficient balance' }) })
      return
    }

    try {
      const validated = withdrawalSchema.parse({
        amount: Number(amount),
        payment_method: selectedMethod,
        phone: phone,
        pin: pin,
      })

      setIsSubmitting(true)

      // TODO: Replace with actual API call
      // const response = await fetch('/api/wallet/withdraw', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(validated),
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Reset form
      setAmount('')
      setPhone('')
      setPin('')
      setSelectedMethod(null)
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      if (error.issues) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message
        })
        setErrors(newErrors)
      } else {
        setErrors({ submit: error.message || t('failedToProcessWithdrawal', { defaultValue: 'Failed to process withdrawal' }) })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('withdrawFunds')}>
      <div className="px-5 py-6 space-y-6">
        {/* Available Balance & Minimum Info - Combined Card */}
        <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#a0a0a8]">{t('availableBalance')}</span>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-white">{formatCurrencyUSD(availableBalance)}</span>
                <span className="text-xs text-[#707079]">{formatCurrency(availableBalance)}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#2d2d35] flex items-center justify-between">
              <span className="text-xs text-[#a0a0a8]">{t('minimumWithdrawal')}</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(MIN_WITHDRAWAL_AMOUNT)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Selection - Profile Page Style */}
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            {t('selectPaymentMethod')}
          </label>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id as 'orange_money' | 'mtn_mobile_money')
                  if (errors.payment_method) {
                    setErrors({ ...errors, payment_method: '' })
                  }
                }}
                className={`w-full bg-[#1f1f24] border rounded-xl p-4 relative hover:bg-[#25252a] hover:border-[#3a3a44] transition-all text-left ${
                  selectedMethod === method.id
                    ? 'border-[#8b5cf6] border-2'
                    : 'border-[#2d2d35]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = document.createElement('div')
                          fallback.className = `w-12 h-12 rounded-full ${method.color.split(' ')[0]} flex items-center justify-center`
                          fallback.textContent = method.id === PAYMENT_METHODS.ORANGE_MONEY ? 'OM' : 'MTN'
                          fallback.style.fontSize = '14px'
                          fallback.style.fontWeight = 'bold'
                          fallback.style.color = method.id === PAYMENT_METHODS.ORANGE_MONEY ? '#fb923c' : '#eab308'
                          target.parentNode?.appendChild(fallback)
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{method.name}</h3>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                            {t('default', { defaultValue: 'Default' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[#a0a0a8] text-xs">
                        {selectedMethod === method.id ? t('selected', { defaultValue: 'Selected' }) : t('tapToSelect', { defaultValue: 'Tap to select' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-2">
                    {/* Switch indicator */}
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                      selectedMethod === method.id ? 'bg-[#8b5cf6]' : 'bg-[#2d2d35]'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        selectedMethod === method.id ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <div className="mt-3 pt-3 border-t border-[#2d2d35]">
                    <HiCheckCircle className="w-5 h-5 text-[#10b981] mx-auto" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.payment_method && (
            <p className="text-xs text-red-400 mt-2">{errors.payment_method}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            {t('amount')}
          </label>
          <Input
            type="text"
            placeholder={t('enterAmount')}
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`bg-[#1f1f24] border-[#2d2d35] text-white ${
              errors.amount ? 'border-red-500' : ''
            }`}
          />
          {errors.amount && (
            <p className="text-xs text-red-400 mt-1">{errors.amount}</p>
          )}
          {amount && !errors.amount && (
            <p className="text-xs text-[#a0a0a8] mt-1">
              {t('min', { defaultValue: 'Min' })}: {formatCurrency(MIN_WITHDRAWAL_AMOUNT)} • {t('max', { defaultValue: 'Max' })}: {formatCurrency(MAX_WITHDRAWAL_AMOUNT)}
            </p>
          )}
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            {t('phoneNumber')}
          </label>
          <Input
            type="tel"
            placeholder="+237XXXXXXXXX"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`bg-[#1f1f24] border-[#2d2d35] text-white ${
              errors.phone ? 'border-red-500' : ''
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
          )}
          {!errors.phone && (
            <p className="text-xs text-[#a0a0a8] mt-1">
              {t('format', { defaultValue: 'Format' })}: +237XXXXXXXXX
            </p>
          )}
        </div>

        {/* PIN Input */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            {t('pin')}
          </label>
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder={t('enter4DigitPin', { defaultValue: 'Enter 4-digit PIN' })}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              maxLength={4}
              className={`bg-[#1f1f24] border-[#2d2d35] text-white pr-12 ${
                errors.pin ? 'border-red-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a8] hover:text-white transition-colors"
            >
              {showPin ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.pin && (
            <p className="text-xs text-red-400 mt-1">{errors.pin}</p>
          )}
          {!errors.pin && (
            <p className="text-xs text-[#a0a0a8] mt-1">
              {t('enter4DigitSecurityPin', { defaultValue: 'Enter your 4-digit security PIN' })}
            </p>
          )}
        </div>

        {/* Fee Calculation */}
        {amount && Number(amount) >= MIN_WITHDRAWAL_AMOUNT && Number(amount) <= MAX_WITHDRAWAL_AMOUNT && (
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#a0a0a8]">{t('amount')}</span>
              <span className="text-white font-medium">{formatCurrency(Number(amount))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#a0a0a8]">{t('fee')} ({PLATFORM_FEES.WITHDRAWAL * 100}%)</span>
              <span className="text-[#a0a0a8]">-{formatCurrency(calculateFee(Number(amount)))}</span>
            </div>
            <div className="pt-2 border-t border-[#2d2d35] flex justify-between">
              <span className="text-white font-semibold">{t('youllReceive')}</span>
              <span className="text-[#10b981] font-bold">{formatCurrency(netAmount)}</span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !selectedMethod || 
            !amount || 
            !phone || 
            !pin || 
            pin.length !== 4 ||
            isSubmitting || 
            Number(amount) < MIN_WITHDRAWAL_AMOUNT ||
            Number(amount) > MAX_WITHDRAWAL_AMOUNT ||
            Number(amount) > availableBalance
          }
          className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
          size="lg"
        >
          {isSubmitting ? (
            t('processing', { defaultValue: 'Processing...' })
          ) : (
            <>
              <HiArrowUp className="w-5 h-5" />
              {t('withdraw')} {amount ? formatCurrency(Number(amount)) : ''}
            </>
          )}
        </Button>
      </div>
    </BottomSheet>
  )
}

