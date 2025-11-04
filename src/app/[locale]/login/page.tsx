import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { LoginForm } from '@/app/components/auth/LoginForm'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage({
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
        <LoginForm />
        <div className="text-center">
          <p className="text-sm text-[#a0a0a8]">
            {t('noAccount')}{' '}
            <Link 
              href="/register" 
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-semibold cursor-pointer"
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

