'use client'

import { useState } from 'react'
import { HiGift } from 'react-icons/hi'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { InviteFriendsContent } from './InviteFriendsContent'
import { useTranslations } from 'next-intl'

interface InviteCardProps {
  referralCode?: string
}

export function InviteCard({ referralCode }: InviteCardProps) {
  const t = useTranslations('profile')
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full theme-bg-secondary theme-border border rounded-xl p-5 text-left hover:theme-bg-tertiary hover:theme-border-secondary transition-all active:scale-[0.98] flex items-center justify-between gap-4 cursor-pointer"
      >
        <div className="flex-1">
          <p className="theme-text-primary font-medium text-sm leading-relaxed">
            {t('inviteFriendsMessage', { defaultValue: 'Invite your friends and win free asset up to $100' })}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/30">
            <HiGift className="w-8 h-8 text-[#8b5cf6]" />
          </div>
        </div>
      </button>

      <BottomSheet 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={t('inviteFriendsTitle', { defaultValue: 'Invite your friends' })}
      >
        <InviteFriendsContent referralCode={referralCode} />
      </BottomSheet>
    </>
  )
}
