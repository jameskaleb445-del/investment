'use client'

import { useState, useEffect } from 'react'
import { HiCreditCard, HiOutlinePlus } from 'react-icons/hi'
import { AiOutlineDelete } from 'react-icons/ai'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface PaymentMethod {
  id: string
  type: 'orange_money' | 'mtn_mobile_money' | 'bank_account'
  account_name: string | null
  account_number: string
  is_default: boolean
  created_at: string
  updated_at: string
}

const PAYMENT_METHOD_TYPES = {
  orange_money: {
    label: 'Orange Money',
    logoUrl: 'https://freelogopng.com/images/all_img/1683000849orange-telecom-logo.png',
    color: 'from-orange-500/20 to-orange-600/10',
    borderColor: 'border-orange-500/30',
  },
  mtn_mobile_money: {
    label: 'MTN Mobile Money',
    logoUrl: 'https://telecoms-channel.co.za/wp-content/uploads/2023/06/MTN_2022_Logo_Yellow_CMYK-removebg-preview.png',
    color: 'from-yellow-500/20 to-yellow-600/10',
    borderColor: 'border-yellow-500/30',
  },
  bank_account: {
    label: 'Bank Account',
    icon: '🏦',
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
  },
} as const

export function PaymentMethods() {
  const t = useTranslations('profile')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: 'orange_money' as 'orange_money' | 'mtn_mobile_money' | 'bank_account',
    accountNumber: '',
    accountName: '',
  })

  // Trigger top loading bar when loading
  useTopLoadingBar(loading || fetchLoading)

  // Fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setFetchLoading(true)
    try {
      const response = await fetch('/api/payment-methods')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods')
      }

      setPaymentMethods(data.paymentMethods || [])
    } catch (error: any) {
      console.error('Error fetching payment methods:', error)
      toast.error(error.message || 'Failed to load payment methods')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleAddPaymentMethod = async () => {
    if (!formData.accountNumber.trim()) {
      toast.error(t('pleaseEnterAccountNumber', { defaultValue: 'Please enter an account number' }))
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          account_number: formData.accountNumber,
          account_name: formData.accountName || null,
          is_default: paymentMethods.length === 0, // Set as default if it's the first one
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add payment method')
      }

      // Refresh payment methods list
      await fetchPaymentMethods()
      setFormData({ type: 'orange_money', accountNumber: '', accountName: '' })
      setIsAddModalOpen(false)
      toast.success(t('paymentMethodAddedSuccess', { defaultValue: 'Payment method added successfully!' }))
    } catch (error: any) {
      toast.error(error.message || t('failedToAddPaymentMethod', { defaultValue: 'Failed to add payment method' }))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setPaymentMethodToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!paymentMethodToDelete) return

    setLoading(true)
    setIsDeleteModalOpen(false)
    
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method')
      }

      // Refresh payment methods list
      await fetchPaymentMethods()
      toast.success(t('paymentMethodRemoved', { defaultValue: 'Payment method removed' }))
    } catch (error: any) {
      toast.error(error.message || t('failedToRemovePaymentMethod', { defaultValue: 'Failed to remove payment method' }))
    } finally {
      setLoading(false)
      setPaymentMethodToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setPaymentMethodToDelete(null)
  }

  const handleSetDefault = async (id: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update default payment method')
      }

      // Refresh payment methods list
      await fetchPaymentMethods()
      toast.success(t('defaultPaymentMethodUpdated', { defaultValue: 'Default payment method updated' }))
    } catch (error: any) {
      toast.error(error.message || t('failedToUpdateDefaultPaymentMethod', { defaultValue: 'Failed to update default payment method' }))
    } finally {
      setLoading(false)
    }
  }

  const formatAccountNumber = (number: string) => {
    // Format as X XX XX XX for display (Cameroon phone number format)
    // Example: 697123456 -> 6 97 12 34 56
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.length >= 9) {
      return cleaned.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5')
    }
    // Fallback for shorter numbers
    return number
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold theme-text-primary px-1">{t('paymentMethods')}</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex  items-center gap-2 px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] theme-text-primary text-sm font-medium rounded-lg !text-white transition-colors cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>{t('add', { defaultValue: 'Add' })}</span>
          </button>
        </div>

        {fetchLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="theme-bg-secondary theme-border border rounded-xl p-4 animate-pulse">
                <div className="h-16 bg-[#2d2d35] rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="theme-bg-secondary theme-border border rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full theme-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <HiCreditCard className="w-8 h-8 theme-text-muted" />
            </div>
            <p className="theme-text-muted text-sm mb-4">{t('noPaymentMethodsAdded', { defaultValue: 'No payment methods added yet' })}</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4 mr-2" />
              {t('addPaymentMethod')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const methodType = PAYMENT_METHOD_TYPES[method.type]
              const displayName = method.account_name || methodType.label
              return (
                <div
                  key={method.id}
                  className="theme-bg-secondary theme-border border rounded-xl p-4 relative hover:theme-bg-tertiary hover:theme-border-secondary transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {'logoUrl' in methodType && methodType.logoUrl ? (
                          <img
                            src={methodType.logoUrl}
                            alt={methodType.label}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{'icon' in methodType ? methodType.icon : '🏦'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="theme-text-primary font-semibold text-sm">{displayName}</h3>
                          {method.is_default && (
                            <span className="px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded-full border border-[#8b5cf6]/30">
                              {t('default', { defaultValue: 'Default' })}
                            </span>
                          )}
                        </div>
                        <p className="theme-text-secondary text-sm font-mono">
                          {formatAccountNumber(method.account_number)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="w-8 h-8 rounded-lg theme-bg-tertiary hover:theme-bg-secondary flex items-center justify-center theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
                          title={t('setAsDefault', { defaultValue: 'Set as default' })}
                        >
                          <HiCreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(method.id)}
                        className="w-8 h-8 rounded-lg theme-bg-tertiary hover:bg-red-500/20 hover:border-red-500/30 flex items-center justify-center theme-text-secondary hover:text-red-400 transition-colors cursor-pointer border border-transparent"
                        title={t('delete', { defaultValue: 'Delete' })}
                      >
                        <AiOutlineDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setFormData({ type: 'orange_money', accountNumber: '', accountName: '' })
        }}
        title={t('addPaymentMethod')}
      >
        <div className="px-5 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="payment-type">{t('paymentMethod', { defaultValue: 'Payment Method' })}</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'orange_money' | 'mtn_mobile_money' | 'bank_account') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full bg-[#1f1f24] theme-border theme-text-primary cursor-pointer">
                <SelectValue>
                  {formData.type && (() => {
                    const methodType = PAYMENT_METHOD_TYPES[formData.type]
                    return (
                      <div className="flex items-center gap-2">
                        {'logoUrl' in methodType && methodType.logoUrl ? (
                          <img
                            src={methodType.logoUrl}
                            alt={methodType.label}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-lg">{'icon' in methodType ? methodType.icon : '🏦'}</span>
                        )}
                        <span>{methodType.label}</span>
                      </div>
                    )
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f24] theme-border">
                <SelectItem
                  value="orange_money"
                  className="theme-text-primary hover:theme-bg-tertiary cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={PAYMENT_METHOD_TYPES.orange_money.logoUrl}
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
                  className="theme-text-primary hover:theme-bg-tertiary cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={PAYMENT_METHOD_TYPES.mtn_mobile_money.logoUrl}
                      alt="MTN Mobile Money"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span>MTN Mobile Money</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="bank_account"
                  className="theme-text-primary hover:theme-bg-tertiary cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{PAYMENT_METHOD_TYPES.bank_account.icon}</span>
                    <span>Bank Account</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'bank_account' && (
            <div className="space-y-2">
              <Label htmlFor="account-name">{t('accountName', { defaultValue: 'Account Name' })}</Label>
              <Input
                id="account-name"
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder={t('enterAccountName', { defaultValue: 'Enter account name' })}
                className="bg-[#1f1f24] theme-border theme-text-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="account-number">
              {formData.type === 'bank_account' ? t('accountNumber', { defaultValue: 'Account Number' }) : t('phoneNumber')}
            </Label>
            <Input
              id="account-number"
              type="tel"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder={
                formData.type === 'bank_account'
                  ? t('enterAccountNumber', { defaultValue: 'Enter account number' })
                  : t('enterPhoneNumberExample', { defaultValue: 'Enter phone number (e.g., 697123456)' })
              }
              className="bg-[#1f1f24] theme-border theme-text-primary"
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleAddPaymentMethod}
              className="w-full cursor-pointer"
              size="lg"
              disabled={loading}
            >
              {loading ? t('adding', { defaultValue: 'Adding...' }) : t('addPaymentMethod')}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <BottomSheet
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title={t('confirmDelete', { defaultValue: 'Confirm Delete' })}
      >
        <div className="px-5 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AiOutlineDelete className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold theme-text-primary mb-2">
              {t('confirmRemovePaymentMethod', { defaultValue: 'Are you sure you want to remove this payment method?' })}
            </h3>
            <p className="text-sm theme-text-secondary">
              {t('deleteWarning', { defaultValue: 'This action cannot be undone.' })}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1 cursor-pointer"
              disabled={loading}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? t('deleting', { defaultValue: 'Deleting...' }) : t('delete', { defaultValue: 'Delete' })}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

