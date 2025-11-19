import { redirect } from '@/i18n/navigation'
import { ResetPasswordForm } from '@/app/components/auth/ResetPasswordForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import Image from 'next/image'

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { token } = await searchParams
  const t = await getTranslations('auth')

  if (!token) {
    redirect({ href: '/forgot-password', locale })
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f]">
      {/* Centered Content */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo - Centered */}
          <div className="flex justify-center">
            <Image
              src="/logos/PORFIT_B_FULL.png"
              alt="Profit Bridge"
              width={280}
              height={120}
              className="w-auto h-16 sm:h-20 object-contain"
              priority
            />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#a0a0a8] hover:text-white transition-colors text-sm"
          >
            <AiOutlineArrowLeft className="w-4 h-4" />
            {t('backToLogin')}
          </Link>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  )
}

