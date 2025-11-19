import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { SetupPinForm } from '@/app/components/auth/SetupPinForm'
import { getTranslations } from 'next-intl/server'
import { LanguageSelector } from '@/app/components/profile/LanguageSelector'
import Image from 'next/image'

export default async function SetupPinPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('auth')

  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login', locale })
  }

  // Check if PIN is already set
  const { data: userProfile } = await supabase
    .from('users')
    .select('pin_set, registration_complete')
    .eq('id', user.id)
    .single()

  // If PIN is already set, redirect to home
  if (userProfile?.pin_set && userProfile?.registration_complete) {
    redirect({ href: '/', locale })
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f] relative">
      {/* Language Selector at top */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

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

          <SetupPinForm />
        </div>
      </div>
    </div>
  )
}

