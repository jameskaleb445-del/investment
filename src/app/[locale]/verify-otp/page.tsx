import { redirect } from '@/i18n/navigation'
import { VerifyOTPForm } from '@/app/components/auth/VerifyOTPForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/app/lib/supabase/server'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface VerifyOTPPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    email?: string
    phone?: string
    type?: 'reset' | 'login' | 'register'
  }>
}

export default async function VerifyOTPPage({ params, searchParams }: VerifyOTPPageProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { email, phone, type = 'reset' } = await searchParams
  const t = await getTranslations('auth')

  if (!email && !phone) {
    redirect({ href: type === 'reset' ? '/forgot-password' : '/login', locale })
  }

  // Skip auth check if Supabase is not configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // For reset password, allow if user is logged in
    if (user && type !== 'reset') {
      redirect({ href: '/', locale })
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Link
          href={type === 'reset' ? '/forgot-password' : '/login'}
          className="inline-flex items-center gap-2 text-[#a0a0a8] hover:text-white transition-colors text-sm"
        >
          <AiOutlineArrowLeft className="w-4 h-4" />
          {t('back')}
        </Link>
        <VerifyOTPForm email={email || undefined} phone={phone || undefined} type={type} />
      </div>
    </div>
  )
}

