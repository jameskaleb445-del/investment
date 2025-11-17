import { createClient } from '@/app/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { PersonalDataForm } from '@/app/components/profile/PersonalDataForm'

export default async function PersonalDataPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { locale } = await params
  const { edit } = await searchParams

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect({ href: '/login', locale })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login', locale })
  }

  // Get user profile data
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect({ href: '/profile', locale })
  }

  const shouldEdit = edit === 'true'

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary">
        <PersonalDataForm 
          user={{
            email: user.email || profile.email || '',
            id: user.id,
          }}
          profile={{
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            email: user.email || profile.email || '',
          }}
          initialEditMode={shouldEdit}
        />
      </div>
    </AppLayout>
  )
}

