import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { RegisterForm } from '@/app/components/auth/RegisterForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { LanguageSelector } from '@/app/components/profile/LanguageSelector'
import { Suspense } from 'react'

export default async function RegisterPage({
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
    <div className="min-h-screen bg-[#1a1a1f] p-4 sm:p-6 py-8 sm:py-12 relative">
      {/* Language Selector at top */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md mx-auto space-y-6">
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[#2d2d35] rounded"></div>
            <div className="h-10 bg-[#2d2d35] rounded"></div>
            <div className="h-10 bg-[#2d2d35] rounded"></div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
        <div className="text-center">
          <p className="text-sm text-[#a0a0a8]">
            {t('alreadyHaveAccount')}{' '}
            <Link 
              href="/login" 
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-semibold cursor-pointer"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

