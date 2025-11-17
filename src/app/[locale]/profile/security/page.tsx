'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { Link } from '@/i18n/navigation'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { 
  HiShieldCheck, 
  HiKey, 
  HiLockClosed,
  HiBell,
  HiMail,
  HiCheckCircle
} from 'react-icons/hi'
import { Switch } from '@/app/components/ui/switch'
import { Button } from '@/app/components/ui/button'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface SecuritySetting {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  type: 'toggle' | 'button'
  key: string
}

interface SecuritySettingsData {
  two_factor_enabled: boolean
  transaction_pin_required: boolean
  security_notifications_enabled: boolean
  email_verification_required: boolean
}

export default function SecurityPage() {
  const t = useTranslations('profile')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [settingsData, setSettingsData] = useState<SecuritySettingsData | null>(null)

  // Trigger top loading bar when loading
  useTopLoadingBar(loading || fetchLoading)

  useEffect(() => {
    fetchSecuritySettings()
  }, [])

  const fetchSecuritySettings = async () => {
    setFetchLoading(true)
    try {
      const response = await fetch('/api/security-settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch security settings')
      }

      setSettingsData(data.settings)
    } catch (error: any) {
      console.error('Error fetching security settings:', error)
      toast.error(error.message || 'Failed to load security settings')
    } finally {
      setFetchLoading(false)
    }
  }

  const settings: SecuritySetting[] = settingsData ? [
    {
      id: 'two-factor',
      key: 'two_factor_enabled',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security when logging in (optional)',
      icon: HiShieldCheck,
      enabled: settingsData.two_factor_enabled,
      type: 'toggle',
    },
    {
      id: 'transaction-pin',
      key: 'transaction_pin_required',
      title: 'Transaction PIN',
      description: 'Require PIN for all transactions',
      icon: HiKey,
      enabled: settingsData.transaction_pin_required,
      type: 'toggle',
    },
    {
      id: 'notifications',
      key: 'security_notifications_enabled',
      title: 'Security Notifications',
      description: 'Get notified about security events',
      icon: HiBell,
      enabled: settingsData.security_notifications_enabled,
      type: 'toggle',
    },
    {
      id: 'email-verification',
      key: 'email_verification_required',
      title: 'Email Verification',
      description: 'Require email verification for sensitive operations',
      icon: HiMail,
      enabled: settingsData.email_verification_required,
      type: 'toggle',
    },
  ] : []

  const toggleSetting = async (id: string, key: string, currentValue: boolean) => {
    if (!settingsData) return

    setLoading(true)
    
    try {
      const response = await fetch('/api/security-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: !currentValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update setting')
      }

      // Update local state
      setSettingsData({
        ...settingsData,
        [key]: !currentValue,
      })
      
      toast.success('Setting updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update setting')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setLoading(true)
    
    try {
      // Get user profile to get email
      const profileResponse = await fetch('/api/profile')
      const profileData = await profileResponse.json()

      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'Failed to get user profile')
      }

      const email = profileData.email

      if (!email) {
        throw new Error('Email not found')
      }

      // Send password reset email
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset link')
      }

      toast.success('Password reset link sent to your email')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 theme-border border-b theme-bg-primary backdrop-blur-sm">
          <Link
            href="/profile"
            className="theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
          >
            <AiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold theme-text-primary">Security</h1>
          <div className="w-6 h-6" /> {/* Spacer for centering */}
        </div>

        {/* Security Status */}
        <div className="px-4 pt-24 pb-4">
          <div className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 border border-[#10b981]/30 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center border border-[#10b981]/30">
                <HiCheckCircle className="w-6 h-6 text-[#10b981]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold theme-text-primary">Account Secure</h2>
                <p className="text-sm theme-text-secondary">Your account is protected with active security features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="px-4 space-y-3 pb-6">
          <h2 className="text-base font-semibold theme-text-primary mb-3 px-1">Security Settings</h2>
          
          {fetchLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="theme-bg-secondary theme-border border rounded-xl p-4 animate-pulse">
                  <div className="h-12 bg-[#2d2d35] rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            settings.map((setting) => {
              const Icon = setting.icon
              return (
                <div
                  key={setting.id}
                  className="theme-bg-secondary theme-border border rounded-xl p-4 hover:theme-bg-tertiary hover:theme-border-secondary transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/20 flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#8b5cf6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="theme-text-primary font-semibold text-sm mb-1">{setting.title}</h3>
                        <p className="theme-text-muted text-xs leading-relaxed">{setting.description}</p>
                      </div>
                    </div>
                    {setting.type === 'toggle' && (
                      <div className="flex items-center flex-shrink-0">
                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={() => toggleSetting(setting.id, setting.key, setting.enabled)}
                          className="cursor-pointer"
                          disabled={loading || fetchLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Change Password Section */}
        <div className="px-4 pb-6">
          <div className="theme-bg-secondary theme-border border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/20">
                <HiLockClosed className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <div className="flex-1">
                <h3 className="theme-text-primary font-semibold text-sm mb-1">Change Password</h3>
                <p className="theme-text-muted text-xs mb-4">Update your password regularly to keep your account secure</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto cursor-pointer"
                  onClick={handleChangePassword}
                  disabled={loading || fetchLoading}
                >
                  {loading ? 'Loading...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
