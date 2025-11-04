import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { ForgotPasswordForm } from '@/app/components/auth/ForgotPasswordForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { AiOutlineArrowLeft } from 'react-icons/ai'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('auth')

  // Skip auth check if Supabase is not configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect({ href: '/', locale })
    }
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
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

