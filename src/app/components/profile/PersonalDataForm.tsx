'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AiOutlineArrowLeft, AiOutlineEdit } from 'react-icons/ai'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import toast from 'react-hot-toast'
import { useTopLoadingBar } from '@/app/hooks/use-top-loading-bar'

interface PersonalDataFormProps {
  user: any
  profile: any
  initialEditMode?: boolean
}

export function PersonalDataForm({ user, profile, initialEditMode = false }: PersonalDataFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user.email?.split('@')[0] || '',
    phone: profile?.phone || '',
    email: user.email || '',
  })

  // Trigger top loading bar when loading
  useTopLoadingBar(loading)

  const handleSave = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
        {/* Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-[#2d2d35] bg-[#1a1a1f] backdrop-blur-sm">
          <Link
            href="/profile"
            className="text-[#a0a0a8] hover:text-white transition-colors"
          >
            <AiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          
          <h1 className="text-lg font-semibold text-white">Personal Data</h1>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#a0a0a8] hover:text-white transition-colors"
            >
              <AiOutlineEdit className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-6 h-6" /> // Spacer
          )}
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center pt-24 pb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold">
              {formData.full_name.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#8b5cf6] border-4 border-[#1a1a1f] flex items-center justify-center">
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 space-y-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 bg-[#2d2d35] border border-[#3a3a44] rounded-lg">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-white text-sm">+1</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="8976 8888 345"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-[#a0a0a8]">Email cannot be changed</p>
          </div>

          {isEditing && (
            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Change'}
              </Button>
            </div>
          )}
        </div>
      </div>
  )
}
