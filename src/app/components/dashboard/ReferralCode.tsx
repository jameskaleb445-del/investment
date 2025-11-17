'use client'

import { useState } from 'react'
import { FaCopy, FaWhatsapp, FaCheck } from 'react-icons/fa'
import { BsInstagram, BsFacebook } from 'react-icons/bs'
import { HiDotsHorizontal } from 'react-icons/hi'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface ReferralCodeProps {
  referralCode: string
}

export function ReferralCode({ referralCode }: ReferralCodeProps) {
  const t = useTranslations('referrals')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!referralCode) {
      toast.error(t('noReferralCode', { defaultValue: 'No referral code available' }))
      return
    }

    // Create full share text with referral code and URL
    const shareText = t('shareText', { referralCode, defaultValue: `Join me on Profit Bridge! Use my referral code: ${referralCode}` })
    const shareUrl = `${window.location.origin}?ref=${referralCode}`
    const fullText = `${shareText} ${shareUrl}`

    try {
      // Use modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText)
        setCopied(true)
        toast.success(t('referralCodeCopied', { defaultValue: 'Referral link copied!' }))
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = fullText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setCopied(true)
          toast.success(t('referralCodeCopied', { defaultValue: 'Referral link copied!' }))
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          toast.error(t('copyFailed', { defaultValue: 'Failed to copy referral link' }))
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error(t('copyFailed', { defaultValue: 'Failed to copy referral link' }))
    }
  }

  const handleShare = async (platform: string) => {
    if (!referralCode) {
      toast.error(t('noReferralCode', { defaultValue: 'No referral code available' }))
      return
    }

    const shareText = t('shareText', { referralCode, defaultValue: `Join me on Profit Bridge! Use my referral code: ${referralCode}` })
    const shareUrl = `${window.location.origin}?ref=${referralCode}`

    switch (platform) {
      case 'whatsapp':
        try {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
          window.open(whatsappUrl, '_blank')
          toast.success(t('openingWhatsApp', { defaultValue: 'Opening WhatsApp...' }))
        } catch (error) {
          toast.error(t('shareFailed', { defaultValue: 'Failed to share on WhatsApp' }))
        }
        break

      case 'instagram':
        // Instagram doesn't have direct share, so copy to clipboard
        await handleCopy()
        toast(t('copyAndShareInstagram', { defaultValue: 'Referral code copied! Paste it on Instagram' }), {
          icon: '📋',
        })
        break

      case 'facebook':
        try {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
          window.open(facebookUrl, '_blank', 'width=600,height=400')
          toast.success(t('openingFacebook', { defaultValue: 'Opening Facebook...' }))
        } catch (error) {
          toast.error(t('shareFailed', { defaultValue: 'Failed to share on Facebook' }))
        }
        break

      case 'native':
        // Use Web Share API if available
        if ('share' in navigator && typeof navigator.share === 'function') {
          try {
            await navigator.share({
              title: t('shareTitle', { defaultValue: 'Join Profit Bridge' }),
              text: shareText,
              url: shareUrl,
            })
            toast.success(t('sharedSuccessfully', { defaultValue: 'Shared successfully!' }))
          } catch (error: any) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
              console.error('Share failed:', error)
              // Fallback to copy
              await handleCopy()
            }
          }
        } else {
          // Fallback to copy if Web Share API not available
          await handleCopy()
        }
        break

      default:
        await handleCopy()
    }
  }

  return (
    <div className="theme-bg-secondary theme-border border rounded-xl p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold theme-text-primary mb-2">{t('yourReferralCode')}</h3>
        <p className="text-sm theme-text-secondary leading-relaxed">
          {t('shareDescription')}
        </p>
      </div>

      {/* Referral Code Input */}
      <div className="relative">
        <Input
          type="text"
          value={referralCode || ''}
          readOnly
          className="theme-bg-tertiary theme-border-secondary theme-text-primary text-base sm:text-lg font-semibold pr-12 sm:pr-14 py-3 cursor-pointer"
          onClick={handleCopy}
          placeholder={t('loading', { defaultValue: 'Loading...' })}
        />
        <button
          onClick={handleCopy}
          disabled={!referralCode}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[#8b5cf6] hover:text-[#7c3aed] transition-colors cursor-pointer p-2 hover:theme-bg-tertiary rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('copy')}
        >
          {copied ? (
            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          ) : (
            <FaCopy className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Sharing Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium theme-text-primary">{t('shareOn')}</p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleCopy}
            disabled={!referralCode}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 theme-bg-tertiary hover:theme-bg-secondary border theme-border-secondary hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('copy')}
          >
            {copied ? (
              <FaCheck className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
            ) : (
              <FaCopy className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs theme-text-primary font-medium hidden sm:inline">{t('copy')}</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            disabled={!referralCode}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 theme-bg-tertiary hover:theme-bg-secondary border theme-border-secondary hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('whatsapp')}
          >
            <FaWhatsapp className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs theme-text-primary font-medium hidden sm:inline">{t('whatsapp')}</span>
          </button>

          <button
            onClick={() => handleShare('instagram')}
            disabled={!referralCode}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 theme-bg-tertiary hover:theme-bg-secondary border theme-border-secondary hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('instagram')}
          >
            <BsInstagram className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs theme-text-primary font-medium hidden sm:inline">{t('instagram')}</span>
          </button>

          <button
            onClick={() => handleShare('share' in navigator && typeof navigator.share === 'function' ? 'native' : 'facebook')}
            disabled={!referralCode}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 theme-bg-tertiary hover:theme-bg-secondary border theme-border-secondary hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={'share' in navigator && typeof navigator.share === 'function' ? t('share', { defaultValue: 'Share' }) : t('facebook', { defaultValue: 'Facebook' })}
          >
            {'share' in navigator && typeof navigator.share === 'function' ? (
              <HiDotsHorizontal className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            ) : (
              <BsFacebook className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs theme-text-primary font-medium hidden sm:inline">
              {'share' in navigator && typeof navigator.share === 'function' ? t('share', { defaultValue: 'Share' }) : t('facebook', { defaultValue: 'Facebook' })}
            </span>
          </button>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm theme-text-secondary mb-2">
          <span className="font-semibold theme-text-primary">{t('commissionStructure')}:</span>
        </p>
        <div className="space-y-2 text-xs theme-text-secondary leading-relaxed">
          <div className="flex flex-col gap-1">
            <p className="flex items-start gap-2">
              <span className="text-[#8b5cf6] mt-0.5">•</span>
              <span className="font-medium">{t('level1', { percentage: '10', defaultValue: 'Level 1 (Direct): Earn 10% cash' })}</span>
            </p>
            <p className="text-[10px] theme-text-muted pl-5 italic">
              {t('level1Example', { defaultValue: 'Example: Get 800 FCFA on Level 1' })}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="flex items-start gap-2">
              <span className="text-[#8b5cf6] mt-0.5">•</span>
              <span className="font-medium">{t('level2', { percentage: '5', defaultValue: 'Level 2 (1 referral away): Earn 5% cash' })}</span>
            </p>
            <p className="text-[10px] theme-text-muted pl-5 italic">
              {t('level2Example', { defaultValue: 'Example: Get 400 FCFA on Level 2' })}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="flex items-start gap-2">
              <span className="text-[#8b5cf6] mt-0.5">•</span>
              <span className="font-medium">{t('level3', { percentage: '2', defaultValue: 'Level 3 (2 referrals away): Earn 2% cash' })}</span>
            </p>
            <p className="text-[10px] theme-text-muted pl-5 italic">
              {t('level3Example', { defaultValue: 'Example: Get 160 FCFA on Level 3' })}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#8b5cf6] mt-3 font-medium leading-relaxed">
          {t('commissionsEarned')}
        </p>
      </div>
    </div>
  )
}

