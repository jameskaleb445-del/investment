import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/app/components/auth/ResetPasswordForm'
import Link from 'next/link'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface ResetPasswordPageProps {
  searchParams: {
    token?: string
  }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = searchParams

  if (!token) {
    redirect('/forgot-password')
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#a0a0a8] hover:text-white transition-colors text-sm"
        >
          <AiOutlineArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}

