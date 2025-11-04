'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { InviteCard } from '@/app/components/profile/InviteCard'
import { AccountDetailsList } from '@/app/components/profile/AccountDetailsList'
import { PaymentMethods } from '@/app/components/profile/PaymentMethods'
import { LanguageSelector } from '@/app/components/profile/LanguageSelector'
import { ProfileSkeleton } from '@/app/components/profile/ProfileSkeleton'
import Link from 'next/link'
import { AiOutlineEdit } from 'react-icons/ai'
import { HiShieldCheck, HiCheckCircle } from 'react-icons/hi'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import { FaRegBell } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [displayEmail, setDisplayEmail] = useState('')

  useTopLoadingBar(loading)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/profile')
      // const data = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))

      // Mock data
      setDisplayName('Helena Sarapova')
      setDisplayEmail('helenasarapova@mail.com')
      setProfile(null)
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }
  // AUTH DISABLED - Commented out temporarily
  // // Check if Supabase is configured
  // if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  //   redirect('/login')
  // }

  // const supabase = await createClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  // // Get user profile data
  // const { data: profile } = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()

  // const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  // const displayEmail = user.email || profile?.email || ''

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
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#10b981] border-4 theme-bg-primary flex items-center justify-center shadow-lg">
                <HiCheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Name and Email */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold theme-text-primary">{displayName}</h1>
              </div>
              <p className="theme-text-secondary text-sm mb-3">{displayEmail}</p>
              <div className="flex items-center gap-2">
                <HiShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-full border border-[#10b981]/30">
                  {t('verifiedAccount')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {/* Invite Friends Card */}
          <div className="px-4 mb-4">
            <InviteCard />
          </div>

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

