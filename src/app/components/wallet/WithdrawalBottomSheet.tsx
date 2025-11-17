'use client'

import { useState, useEffect } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { formatCurrency, formatCurrencyUSD } from '@/app/utils/format'
import { PAYMENT_METHODS, MIN_WITHDRAWAL_AMOUNT, MAX_WITHDRAWAL_AMOUNT, PLATFORM_FEES } from '@/app/constants/projects'
import { withdrawalSchema } from '@/app/validation/wallet'
import { HiArrowUp, HiEye, HiEyeOff, HiStar, HiOutlinePlus } from 'react-icons/hi'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Label } from '@/app/components/ui/label'

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
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string
    type: 'orange_money' | 'mtn_mobile_money'
    account_number: string
    account_name: string | null
    is_default: boolean
  }>>([])
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({
    type: 'orange_money' as 'orange_money' | 'mtn_mobile_money',
    accountNumber: '',
    accountName: '',
  })
  const [isAddingMethod, setIsAddingMethod] = useState(false)

  // Fetch payment methods and user's phone when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods()
      fetchUserPhone()
      setShowAddForm(false) // Reset add form when sheet opens
    }
  }, [isOpen])

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true)
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        // Filter to only mobile money methods (orange_money, mtn_mobile_money)
        const mobileMoneyMethods = (data.paymentMethods || []).filter(
          (pm: any) => pm.type === 'orange_money' || pm.type === 'mtn_mobile_money'
        )
        setPaymentMethods(mobileMoneyMethods)
        
        // Set default selected method
        if (mobileMoneyMethods.length > 0) {
          const defaultMethod = mobileMoneyMethods.find((pm: any) => pm.is_default) || mobileMoneyMethods[0]
          setSelectedMethod(defaultMethod.type)
          if (defaultMethod.account_number) {
            setPhone(defaultMethod.account_number)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setLoadingMethods(false)
    }
  }

  const fetchUserPhone = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.phone && !phone) {
          setPhone(data.phone)
        }
      }
    } catch (error) {
      // Silently fail - user can enter phone manually
      console.error('Failed to fetch user phone:', error)
    }
  }

  const getPaymentMethodDisplay = (type: string) => {
    switch (type) {
      case 'orange_money':
        return {
          name: 'Orange Money',
          icon: 'https://freelogopng.com/images/all_img/1683000849orange-telecom-logo.png',
          color: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        }
      case 'mtn_mobile_money':
        return {
          name: 'MTN Mobile Money',
          icon: 'https://telecoms-channel.co.za/wp-content/uploads/2023/06/MTN_2022_Logo_Yellow_CMYK-removebg-preview.png',
          color: 'bg-yellow-500/20 border-yellow-500/30 theme-text-primary',
        }
      default:
        return {
          name: type,
          icon: '',
          color: 'bg-gray-500/20 border-gray-500/30 theme-text-primary',
        }
    }
  }

  const handleAddPaymentMethod = async () => {
    if (!addFormData.accountNumber.trim()) {
      toast.error(t('pleaseEnterAccountNumber', { defaultValue: 'Please enter an account number' }))
      return
    }

    setIsAddingMethod(true)
    
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: addFormData.type,
          account_number: addFormData.accountNumber,
          account_name: addFormData.accountName || null,
          is_default: paymentMethods.length === 0, // Set as default if it's the first one
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add payment method')
      }

      // Refresh payment methods list
      await fetchPaymentMethods()
      setAddFormData({ type: 'orange_money', accountNumber: '', accountName: '' })
      setShowAddForm(false)
      toast.success(t('paymentMethodAddedSuccess', { defaultValue: 'Payment method added successfully!' }))
    } catch (error: any) {
      toast.error(error.message || t('failedToAddPaymentMethod', { defaultValue: 'Failed to add payment method' }))
    } finally {
      setIsAddingMethod(false)
    }
  }

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
        payment_method: selectedMethod as 'orange_money' | 'mtn_mobile_money',
        phone: phone,
        pin: pin,
      })

      setIsSubmitting(true)

      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('failedToProcessWithdrawal', { defaultValue: 'Failed to process withdrawal' }))
      }

      // Success
      toast.success(t('withdrawalInitiated', { defaultValue: 'Withdrawal request submitted successfully!' }))

      // Reset form
      setAmount('')
      setPhone('')
      setPin('')
      if (paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find(pm => pm.is_default) || paymentMethods[0]
        setSelectedMethod(defaultMethod.type)
        if (defaultMethod.account_number) {
          setPhone(defaultMethod.account_number)
        }
      } else {
        setSelectedMethod(null)
      }
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      if (error.issues) {
        // Zod validation errors
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message
        })
        setErrors(newErrors)
        toast.error(t('pleaseCheckForm', { defaultValue: 'Please check the form for errors' }))
      } else {
        const errorMessage = error.message || t('failedToProcessWithdrawal', { defaultValue: 'Failed to process withdrawal' })
        setErrors({ submit: errorMessage })
        toast.error(errorMessage)
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
                <span className="text-lg font-bold text-white">{formatCurrency(availableBalance)}</span>
                <span className="text-xs text-[#707079]">{formatCurrencyUSD(availableBalance)}</span>
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
          {loadingMethods ? (
            <div className="space-y-3">
              <div className="w-full bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4 animate-pulse">
                <div className="h-12 bg-gray-300/20 rounded"></div>
              </div>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="space-y-4">
              {!showAddForm ? (
                <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-6 text-center">
                  <p className="text-sm text-[#a0a0a8] mb-4">
                    {t('noPaymentMethods', { defaultValue: 'No payment methods found. Add one to continue.' })}
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                  >
                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                    {t('addPaymentMethod', { defaultValue: 'Add Payment Method' })}
                  </Button>
                </div>
              ) : (
                <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      {t('addPaymentMethod', { defaultValue: 'Add Payment Method' })}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setAddFormData({ type: 'orange_money', accountNumber: '', accountName: '' })
                      }}
                      className="text-sm text-[#a0a0a8] hover:text-white"
                    >
                      {t('cancel', { defaultValue: 'Cancel' })}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm text-white">
                        {t('paymentMethod', { defaultValue: 'Payment Method' })}
                      </Label>
                      <Select
                        value={addFormData.type}
                        onValueChange={(value: 'orange_money' | 'mtn_mobile_money') =>
                          setAddFormData({ ...addFormData, type: value })
                        }
                      >
                        <SelectTrigger className="w-full bg-[#2d2d35] border-[#3a3a44] text-white cursor-pointer">
                          <SelectValue>
                            {(() => {
                              const display = getPaymentMethodDisplay(addFormData.type)
                              return (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={display.icon}
                                    alt={display.name}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                  <span>{display.name}</span>
                                </div>
                              )
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#2d2d35] border-[#3a3a44]">
                          <SelectItem
                            value="orange_money"
                            className="text-white hover:bg-[#35353d] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={getPaymentMethodDisplay('orange_money').icon}
                                alt="Orange Money"
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <span>Orange Money</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="mtn_mobile_money"
                            className="text-white hover:bg-[#35353d] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={getPaymentMethodDisplay('mtn_mobile_money').icon}
                                alt="MTN Mobile Money"
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <span>MTN Mobile Money</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-white">
                        {t('phoneNumber')}
                      </Label>
                      <Input
                        type="tel"
                        value={addFormData.accountNumber}
                        onChange={(e) => setAddFormData({ ...addFormData, accountNumber: e.target.value })}
                        placeholder={t('enterPhoneNumberExample', { defaultValue: 'Enter phone number (e.g., 697123456)' })}
                        className="bg-[#2d2d35] border-[#3a3a44] text-white"
                      />
                    </div>

                    <Button
                      onClick={handleAddPaymentMethod}
                      className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                      disabled={isAddingMethod || !addFormData.accountNumber.trim()}
                    >
                      {isAddingMethod ? t('adding', { defaultValue: 'Adding...' }) : t('add', { defaultValue: 'Add' })}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const display = getPaymentMethodDisplay(method.type)
                const isSelected = selectedMethod === method.type
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.type)
                      if (method.account_number) {
                        setPhone(method.account_number)
                      }
                      if (errors.payment_method) {
                        setErrors({ ...errors, payment_method: '' })
                      }
                    }}
                    className={`w-full bg-[#1f1f24] border rounded-xl p-4 relative hover:bg-[#25252a] hover:border-[#3a3a44] transition-all text-left ${
                      isSelected
                        ? 'border-[#8b5cf6] border-2 shadow-[0_0_20px_rgba(139,92,246,0.5)] ring-2 ring-[#8b5cf6]/30'
                        : 'border-[#2d2d35] hover:border-[#8b5cf6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={display.icon}
                            alt={display.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = document.createElement('div')
                              fallback.className = `w-12 h-12 rounded-full ${display.color.split(' ')[0]} flex items-center justify-center`
                              fallback.textContent = method.type === 'orange_money' ? 'OM' : 'MTN'
                              fallback.style.fontSize = '14px'
                              fallback.style.fontWeight = 'bold'
                              fallback.style.color = method.type === 'orange_money' ? '#fb923c' : '#eab308'
                              target.parentNode?.appendChild(fallback)
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm">{display.name}</h3>
                            {method.is_default && (
                              <span className="px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                                {t('default', { defaultValue: 'Default' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[#a0a0a8] text-xs truncate">
                            {method.account_number || method.account_name || t('tapToSelect', { defaultValue: 'Tap to select' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-2">
                        {/* Switch indicator */}
                        <div className={`relative w-11 h-6 rounded-full transition-colors ${
                          isSelected 
                            ? 'bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.6)]' 
                            : 'bg-gray-300 dark:bg-[#2d2d35]'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                            isSelected ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
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

