'use client'

import { useEffect, useState } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { HiRefresh } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'

export function AppUpdatePrompt() {
  const t = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedVersion = localStorage.getItem('app_version')

      if (!storedVersion) {
        localStorage.setItem('app_version', APP_VERSION)
        return
      }

      if (storedVersion !== APP_VERSION) {
        setIsOpen(true)
      }
    } catch (error) {
      console.warn('Unable to check app version', error)
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
  }

  const handleUpdate = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(async (registration) => {
            try {
              await registration.update()
            } catch (error) {
              console.warn('Failed to update service worker', error)
            }
          })
        )
      }

      if ('caches' in window) {
        const cacheKeys = await caches.keys()
        await Promise.all(
          cacheKeys.map(async (key) => {
            try {
              await caches.delete(key)
            } catch (error) {
              console.warn('Failed to delete cache', error)
            }
          })
        )
      }
    } catch (error) {
      console.warn('Error while updating app', error)
    } finally {
      try {
        localStorage.setItem('app_version', APP_VERSION)
      } catch (error) {
        console.warn('Unable to store app version', error)
      }

      window.location.reload()
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleDismiss}
      title={t('updateAvailable')}
    >
      <div className="px-5 py-6 space-y-4">
        <p className="text-sm theme-text-secondary leading-relaxed">
          {t('updateDescription')}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="sm:min-w-[140px]"
            onClick={handleDismiss}
            disabled={isUpdating}
          >
            {t('later')}
          </Button>
          <Button
            size="sm"
            className="sm:min-w-[160px] flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed]"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            <HiRefresh className="w-4 h-4" />
            {isUpdating ? t('updating') : t('updateNow')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

