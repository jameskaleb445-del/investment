'use client'

import { useState } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import Link from 'next/link'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { 
  HiShieldCheck, 
  HiKey, 
  HiLockClosed,
  HiFingerPrint,
  HiDeviceMobile,
  HiBell,
  HiMail,
  HiCheckCircle
} from 'react-icons/hi'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'
import toast from 'react-hot-toast'

interface SecuritySetting {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  type: 'toggle' | 'button'
}

export default function SecurityPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: HiShieldCheck,
      enabled: false,
      type: 'toggle',
    },
    {
      id: 'transaction-pin',
      title: 'Transaction PIN',
      description: 'Require PIN for all transactions',
      icon: HiKey,
      enabled: true,
      type: 'toggle',
    },
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face ID to login',
      icon: HiFingerPrint,
      enabled: false,
      type: 'toggle',
    },
    {
      id: 'device-lock',
      title: 'Device Lock',
      description: 'Lock account when accessed from new devices',
      icon: HiDeviceMobile,
      enabled: true,
      type: 'toggle',
    },
    {
      id: 'notifications',
      title: 'Security Notifications',
      description: 'Get notified about security events',
      icon: HiBell,
      enabled: true,
      type: 'toggle',
    },
    {
      id: 'email-verification',
      title: 'Email Verification',
      description: 'Require email verification for sensitive operations',
      icon: HiMail,
      enabled: true,
      type: 'toggle',
    },
  ])

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  const toggleSetting = async (id: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setSettings(settings.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      ))
      
      toast.success('Setting updated successfully')
    } catch (error) {
      toast.error('Failed to update setting')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Password change link sent to your email')
    } catch (error) {
      toast.error('Failed to send password change link')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      toast.success('Session revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#1a1a1f]">
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-[#2d2d35] bg-[#1a1a1f] backdrop-blur-sm">
          <Link
            href="/profile"
            className="text-[#9ca3af] hover:text-white transition-colors"
          >
            <AiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Security</h1>
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
                <h2 className="text-lg font-bold text-white">Account Secure</h2>
                <p className="text-sm text-[#9ca3af]">Your account is protected with active security features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="px-4 space-y-3 pb-6">
          <h2 className="text-base font-semibold text-white mb-3 px-1">Security Settings</h2>
          
          {settings.map((setting) => {
            const Icon = setting.icon
            return (
              <div
                key={setting.id}
                className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4 hover:bg-[#25252a] hover:border-[#3a3a44] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/20 flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1">{setting.title}</h3>
                      <p className="text-[#6b7280] text-xs leading-relaxed">{setting.description}</p>
                    </div>
                  </div>
                  {setting.type === 'toggle' && (
                    <div className="flex items-center flex-shrink-0">
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={() => toggleSetting(setting.id)}
                        className="cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Change Password Section */}
        <div className="px-4 pb-6">
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/20">
                <HiLockClosed className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">Change Password</h3>
                <p className="text-[#6b7280] text-xs mb-4">Update your password regularly to keep your account secure</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="px-4 pb-6">
          <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Active Sessions</h3>
                <p className="text-[#6b7280] text-xs">Manage devices that have access to your account</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#8b5cf6] hover:text-[#7c3aed]"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#2d2d35] rounded-lg">
                <div className="flex items-center gap-3">
                  <HiDeviceMobile className="w-5 h-5 text-[#9ca3af]" />
                  <div>
                    <p className="text-white text-sm font-medium">iPhone 14 Pro</p>
                    <p className="text-[#6b7280] text-xs">Current session • iOS</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-[#10b981]/20 text-[#10b981] text-xs font-medium rounded-md border border-[#10b981]/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
