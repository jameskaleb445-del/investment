'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { Button } from '../ui'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    full_name: '',
    referral_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      router.push('/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [agreeToTerms, setAgreeToTerms] = useState(false)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text- sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Create your account</h2>
        <p className="text-[#a0a0a8] text-sm sm:text-base">
          Let's get started with a free account.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => {
              setFormData({ ...formData, full_name: e.target.value })
              setError('')
            }}
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value })
              setError('')
            }}
            placeholder="+237 6XX XXX XXX"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referral_code">Referral Code (Optional)</Label>
          <Input
            id="referral_code"
            type="text"
            value={formData.referral_code}
            onChange={(e) =>
              setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })
            }
            placeholder="Enter referral code"
          />
        </div>
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-xs font-normal leading-relaxed cursor-pointer">
          I certify that I'm 18 years of age or older, and I agree to the{' '}
          <Link href="/terms" className="text-[#8b5cf6] hover:underline cursor-pointer">User Agreement</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#8b5cf6] hover:underline cursor-pointer">Privacy Policy</Link>.
        </Label>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        size="lg"
        disabled={!agreeToTerms || loading}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3a3a44]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#1a1a1f] text-[#a0a0a8]">Or sign up with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FaApple className="w-5 h-5" />
          <span className="font-medium">Apple</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] transition-colors cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">Google</span>
        </button>
      </div>
    </form>
  )
}

