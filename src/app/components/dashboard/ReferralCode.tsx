'use client'

import { useState } from 'react'
import { FaCopy, FaWhatsapp } from 'react-icons/fa'
import { BsInstagram } from 'react-icons/bs'
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
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success(t('referralCodeCopied', { defaultValue: 'Referral code copied!' }))
  }

  const handleShare = (platform: string) => {
    const shareText = t('shareText', { referralCode, defaultValue: `Join me on this investment platform! Use my referral code: ${referralCode}` })
    const shareUrl = `${window.location.origin}?ref=${referralCode}`

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
        break
      case 'instagram':
        toast.info(t('copyAndShareInstagram', { defaultValue: 'Copy the referral code and share it on Instagram!' }))
        handleCopy()
        break
      default:
        handleCopy()
    }
  }

  return (
    <div className="bg-[#1f1f24] border border-[#2d2d35] rounded-xl p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{t('yourReferralCode')}</h3>
        <p className="text-sm text-[#a0a0a8] leading-relaxed">
          {t('shareDescription')}
        </p>
      </div>

      {/* Referral Code Input */}
      <div className="relative">
        <Input
          type="text"
          value={referralCode}
          readOnly
          className="bg-[#2d2d35] border-[#3a3a44] text-white text-base sm:text-lg font-semibold pr-12 sm:pr-14 py-3 cursor-pointer"
          onClick={handleCopy}
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[#8b5cf6] hover:text-[#7c3aed] transition-colors cursor-pointer p-2 hover:bg-[#3a3a44] rounded-lg active:scale-95"
        >
          <FaCopy className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Sharing Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">{t('shareOn')}</p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-[#2d2d35] hover:bg-[#35353d] border border-[#3a3a44] hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95"
            title={t('copy')}
          >
            <FaCopy className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white font-medium hidden sm:inline">{t('copy')}</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-[#2d2d35] hover:bg-[#35353d] border border-[#3a3a44] hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95"
            title={t('whatsapp')}
          >
            <FaWhatsapp className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white font-medium hidden sm:inline">{t('whatsapp')}</span>
          </button>

          <button
            onClick={() => handleShare('instagram')}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-[#2d2d35] hover:bg-[#35353d] border border-[#3a3a44] hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95"
            title={t('instagram')}
          >
            <BsInstagram className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white font-medium hidden sm:inline">{t('instagram')}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-[#2d2d35] hover:bg-[#35353d] border border-[#3a3a44] hover:border-[#8b5cf6]/50 rounded-lg transition-all cursor-pointer group active:scale-95"
            title={t('more')}
          >
            <HiDotsHorizontal className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white font-medium hidden sm:inline">{t('more')}</span>
          </button>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-[#a0a0a8] mb-2">
          <span className="font-semibold text-white">{t('commissionStructure')}:</span>
        </p>
        <div className="space-y-1.5 text-xs text-[#a0a0a8] leading-relaxed">
          <p className="flex items-start gap-2">
            <span className="text-[#8b5cf6] mt-0.5">•</span>
            <span>{t('level1', { percentage: '10', defaultValue: 'Level 1 (Direct): 10% commission' })}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#8b5cf6] mt-0.5">•</span>
            <span>{t('level2', { percentage: '5', defaultValue: 'Level 2 (1 referral away): 5% commission' })}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#8b5cf6] mt-0.5">•</span>
            <span>{t('level3', { percentage: '2', defaultValue: 'Level 3 (2 referrals away): 2% commission' })}</span>
          </p>
        </div>
        <p className="text-xs text-[#8b5cf6] mt-3 font-medium leading-relaxed">
          {t('commissionsEarned')}
        </p>
      </div>
    </div>
  )
}

