'use client'

import { FaCopy, FaWhatsapp } from 'react-icons/fa'
import { BsInstagram } from 'react-icons/bs'
import { HiDotsHorizontal } from 'react-icons/hi'
import { Input } from '@/app/components/ui/input'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export function InviteFriendsContent() {
  const t = useTranslations('profile')
  const tReferrals = useTranslations('referrals')
  const referralCode = '@helena02' // Replace with actual referral code
  const earningsAmount = '$5'
  const lessonsCompleted = '1'
  const investmentsLearned = '4'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success(tReferrals('referralCodeCopied', { defaultValue: 'Referral code copied!' }))
  }

  const handleShare = (platform: string) => {
    const shareText = tReferrals('shareText', { referralCode, defaultValue: `Join me on this investment platform! Use my referral code: ${referralCode}` })
    const shareUrl = `${window.location.origin}?ref=${referralCode}`

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
        break
      case 'instagram':
        // Instagram doesn't support direct sharing, open in new tab
        toast.info(tReferrals('copyAndShareInstagram', { defaultValue: 'Copy the referral code and share it on Instagram!' }))
        handleCopy()
        break
      default:
        handleCopy()
    }
  }

  return (
    <div className="px-5 py-6 space-y-6 pb-8">
      {/* Helena Journeys Section */}
      <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-xl p-5 shadow-lg">
        <h3 className="text-lg font-bold theme-text-primary mb-3">{t('helenaJourneys', { defaultValue: 'Helena journeys' })}</h3>
        <p className="text-sm theme-text-secondary leading-relaxed">
          {t('earnedAssetsMessage', { 
            earnings: earningsAmount, 
            lessons: lessonsCompleted, 
            investments: investmentsLearned
          })}
        </p>
      </div>

      {/* Referral Code Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold theme-text-primary">
          {t('useReferralCodeEarnCommission', { defaultValue: 'Use referral code and earn commission' })}
        </h3>
        <div className="relative">
          <Input
            type="text"
            value={referralCode}
            readOnly
            className="theme-bg-secondary theme-border theme-text-primary text-lg font-semibold pr-14 py-3"
          />
          <button
            onClick={handleCopy}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5cf6] hover:text-[#7c3aed] transition-colors cursor-pointer p-2 hover:theme-bg-tertiary rounded-lg"
          >
            <FaCopy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sharing Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold theme-text-primary">{t('share', { defaultValue: 'Share' })}</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2.5 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full theme-bg-tertiary theme-border-secondary border flex items-center justify-center hover:theme-bg-secondary hover:border-[#8b5cf6]/50 transition-all group-active:scale-95">
              <FaCopy className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <span className="text-xs theme-text-secondary font-medium">{tReferrals('copy')}</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center gap-2.5 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full theme-bg-tertiary theme-border-secondary border flex items-center justify-center hover:theme-bg-secondary hover:border-[#8b5cf6]/50 transition-all group-active:scale-95">
              <FaWhatsapp className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <span className="text-xs theme-text-secondary font-medium">{tReferrals('whatsapp')}</span>
          </button>

          <button
            onClick={() => handleShare('instagram')}
            className="flex flex-col items-center gap-2.5 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full theme-bg-tertiary theme-border-secondary border flex items-center justify-center hover:theme-bg-secondary hover:border-[#8b5cf6]/50 transition-all group-active:scale-95">
              <BsInstagram className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <span className="text-xs theme-text-secondary font-medium">{tReferrals('instagram')}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2.5 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full theme-bg-tertiary theme-border-secondary border flex items-center justify-center hover:theme-bg-secondary hover:border-[#8b5cf6]/50 transition-all group-active:scale-95">
              <HiDotsHorizontal className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <span className="text-xs theme-text-secondary font-medium">{tReferrals('more')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

