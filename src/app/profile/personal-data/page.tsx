import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { PersonalDataForm } from '@/app/components/profile/PersonalDataForm'
import Link from 'next/link'
import { AiOutlineArrowLeft } from 'react-icons/ai'

export default async function PersonalDataPage({
  searchParams,
}: {
  searchParams: { edit?: string }
}) {
  // AUTH DISABLED - Commented out temporarily
  // // Check if Supabase is configured
  // if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  //   redirect('/login')
  // }

  // const supabase = await createClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  // // Get user profile data
  // const { data: profile } = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()

  // Mock data for testing
  const user = {
    email: 'helenasarapova@mail.com',
    id: 'mock-user-id',
  }
  const profile = {
    full_name: 'Helena Sarapova',
    phone: '89768888345',
    email: 'helenasarapova@mail.com',
  }

  const shouldEdit = searchParams?.edit === 'true'

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#1a1a1f]">
        <PersonalDataForm 
          user={user}
          profile={profile}
          initialEditMode={shouldEdit}
        />
      </div>
    </AppLayout>
  )
}

