import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/app/components/auth/LoginForm'
import Link from 'next/link'

export default async function LoginPage() {
  // Skip auth check if Supabase is not configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <LoginForm />
        <div className="text-center">
          <p className="text-sm text-[#a0a0a8]">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-semibold cursor-pointer"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

