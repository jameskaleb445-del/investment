'use client'

import { HiUser, HiUserCircle } from 'react-icons/hi'
import { formatCurrencyUSD } from '@/app/utils/format'
import { useTranslations } from 'next-intl'

interface ReferralUser {
  id: string
  name: string
  email: string
  referralCode: string
  totalInvested?: number
  totalDeposited?: number
  joinedAt: string
}

interface ReferralLevel {
  level: number
  users: ReferralUser[]
}

interface ReferralTreeProps {
  levels: ReferralLevel[]
}

export function ReferralTree({ levels }: ReferralTreeProps) {
  const t = useTranslations('referrals')
  if (levels.length === 0) {
    return (
      <div className="theme-bg-secondary theme-border border rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full theme-bg-tertiary flex items-center justify-center mx-auto mb-4">
          <HiUserCircle className="w-8 h-8 theme-text-muted" />
        </div>
        <h3 className="text-lg font-semibold theme-text-primary mb-2">{t('noReferralsYet')}</h3>
        <p className="text-sm theme-text-muted">
          {t('startSharing')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {levels.map((levelData) => (
        <div key={levelData.level} className="theme-bg-secondary theme-border border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#8b5cf6] font-bold text-xs sm:text-sm">{levelData.level}</span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold theme-text-primary flex-1 min-w-0">
              {t('levelReferrals', { level: levelData.level })}
            </h3>
            <span className="px-2 py-0.5 theme-bg-tertiary theme-text-secondary text-xs font-medium rounded-full flex-shrink-0">
              {levelData.users.length}
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {levelData.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 sm:p-3 theme-bg-tertiary rounded-lg hover:theme-bg-secondary transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center theme-text-primary font-semibold text-sm sm:text-base flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="theme-text-primary font-medium text-xs sm:text-sm truncate">{user.name}</p>
                    <p className="text-xs theme-text-muted truncate">{user.email}</p>
                  </div>
                </div>
                {(user.totalInvested || user.totalDeposited) && (
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs theme-text-primary font-medium whitespace-nowrap">
                      {formatCurrencyUSD((user.totalInvested || 0) + (user.totalDeposited || 0))}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

