import { redirect } from '@/i18n/navigation'
import { ResetPasswordForm } from '@/app/components/auth/ResetPasswordForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { AiOutlineArrowLeft } from 'react-icons/ai'

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
    <div className="min-h-screen bg-[#1a1a1f] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
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
  )
}

