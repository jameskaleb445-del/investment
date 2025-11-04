'use client'

import { Link } from '@/i18n/navigation'
import { HiUser, HiShieldCheck, HiDocumentText } from 'react-icons/hi'
import { AiOutlineRight } from 'react-icons/ai'
import { useTranslations } from 'next-intl'

interface AccountDetailItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  titleKey: string
  descriptionKey: string
}

export function AccountDetailsList() {
  const t = useTranslations('profile')
  
  const accountItems: AccountDetailItem[] = [
    {
      href: '/profile/personal-data',
      icon: HiUser,
      titleKey: 'personalData',
      descriptionKey: 'personalDataDescription',
    },
    {
      href: '/profile/security',
      icon: HiShieldCheck,
      titleKey: 'security',
      descriptionKey: 'securityDescription',
    },
    {
      href: '/profile/transactions',
      icon: HiDocumentText,
      titleKey: 'transactionHistory',
      descriptionKey: 'transactionHistoryDescription',
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold theme-text-primary mb-3 px-1">{t('accountSettings', { defaultValue: 'Account Settings' })}</h2>
      
      <div className="space-y-2">
        {accountItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 theme-bg-secondary theme-border border rounded-xl hover:theme-bg-tertiary hover:theme-border-secondary transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 flex items-center justify-center border border-[#8b5cf6]/20 group-hover:border-[#8b5cf6]/40 transition-colors">
                <Icon className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="theme-text-primary font-semibold text-sm mb-0.5">{t(item.titleKey)}</h3>
                <p className="theme-text-muted text-xs">{t(item.descriptionKey)}</p>
              </div>
              
              <AiOutlineRight className="w-5 h-5 theme-text-muted group-hover:theme-text-secondary transition-colors flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

