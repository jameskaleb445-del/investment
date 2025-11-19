import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { ForgotPasswordForm } from '@/app/components/auth/ForgotPasswordForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import Image from 'next/image'

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
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}

