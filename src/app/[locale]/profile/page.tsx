'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { InviteCard } from '@/app/components/profile/InviteCard'
import { AccountDetailsList } from '@/app/components/profile/AccountDetailsList'
import { PaymentMethods } from '@/app/components/profile/PaymentMethods'
import { LanguageSelector } from '@/app/components/profile/LanguageSelector'
import { ProfileSkeleton } from '@/app/components/profile/ProfileSkeleton'
import { HiShieldCheck, HiCheckCircle } from 'react-icons/hi'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { FaRegBell } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

interface ProfileData {
  id: string
  email: string
  phone: string
  full_name: string
  referral_code: string
  role: string
  email_verified: boolean
  phone_verified: boolean
  pin_set: boolean
  registration_complete: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
  wallet: {
    balance: number
    invested_amount: number
    pending_withdrawal: number
    total_earnings: number
    available_balance: number
  } | null
  referral_count: number
}

export default function ProfilePage() {
  const router = useRouter()
  const t = useTranslations('profile')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useTopLoadingBar(loading)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data)
    } catch (err: any) {
      console.error('Error fetching profile data:', err)
      setError(err.message || 'Failed to load profile')
      if (err.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User'
  const displayEmail = profile?.email || ''
  const isVerified = profile?.email_verified || profile?.phone_verified || false

  if (loading) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary flex flex-col">
        {/* Sticky Header */}
        <div className="fixed top-0 left-0 right-0 z-50 theme-bg-primary px-4 py-3 flex items-center justify-between theme-border border-b backdrop-blur-sm">
          <span className="theme-text-primary font-semibold text-base">{t('title')}</span>
          <div className="flex items-center gap-4">
            <button className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer relative">
              <FaRegBell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
        
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="px-4 pt-20 pb-6">
          <div className="flex flex-col items-center mb-6">
            {/* Profile Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#8b5cf6]/30">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="select-none">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {/* Verified badge */}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#10b981] border-4 theme-bg-primary flex items-center justify-center shadow-lg">
                  <HiCheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name and Email */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold theme-text-primary">{displayName}</h1>
              </div>
              <p className="theme-text-secondary text-sm mb-3">{displayEmail}</p>
              {profile?.phone && (
                <p className="theme-text-secondary text-xs mb-3">{profile.phone}</p>
              )}
              {isVerified && (
                <div className="flex items-center gap-2">
                  <HiShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                    {t('verifiedAccount')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 mb-4">
            <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
              <button
                onClick={fetchProfileData}
                className="mt-2 w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {/* Invite Friends Card */}
          {profile && (
            <div className="px-4 mb-4">
              <InviteCard referralCode={profile.referral_code} />
            </div>
          )}

          {/* Payment Methods */}
          <div className="px-4 mb-4">
            <PaymentMethods />
          </div>

          {/* Language Selection */}
          <div className="px-4 mb-4">
            <div className="theme-bg-secondary theme-border border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-base font-semibold theme-text-primary mb-1">{t('languageAndRegion')}</h2>
                  <p className="theme-text-secondary text-xs">{t('chooseLanguage')}</p>
                </div>
                <LanguageSelector />
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="px-4">
            <AccountDetailsList />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}


