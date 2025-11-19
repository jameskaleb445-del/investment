'use client'

import { useEffect, useState, useRef } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { useTranslations } from 'next-intl'
import { HiRefresh } from 'react-icons/hi'

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const t = useTranslations('common')

  // Service worker update detection - primary method
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let updateInterval: NodeJS.Timeout | null = null

    // Get service worker registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return

      setRegistration(reg)

      // Check if there's a waiting service worker (update available)
      if (reg.waiting) {
        setUpdateAvailable(true)
        return
      }

      // Listen for service worker updates
      const checkForUpdates = () => {
        reg.update().catch(() => {
          // Silently fail if update check fails
        })
      }

      // Check for updates periodically (every 60 seconds)
      updateInterval = setInterval(checkForUpdates, 60000)

      // Listen for updatefound event (when a new service worker is found)
      const handleUpdateFound = () => {
        const newWorker = reg.installing || reg.waiting
        if (!newWorker) return

        // If there's already a waiting worker, show prompt immediately
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setUpdateAvailable(true)
          if (updateInterval) {
            clearInterval(updateInterval)
          }
          return
        }

        const handleStateChange = () => {
          // When the new service worker is installed and there's an active controller,
          // it means there's an update waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
            if (updateInterval) {
              clearInterval(updateInterval)
            }
          }
        }

        newWorker.addEventListener('statechange', handleStateChange)
      }

      // Listen for controller change (when new service worker takes control)
      // Note: We don't auto-reload here - the user must click "Update" button
      const handleControllerChange = () => {
        // Only update the state, don't auto-reload
        // The reload will happen when user clicks "Update Now"
        console.log('Service worker controller changed')
      }

      reg.addEventListener('updatefound', handleUpdateFound)
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      // Initial check
      checkForUpdates()

      // Cleanup function
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval)
        }
        reg.removeEventListener('updatefound', handleUpdateFound)
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    })

    // Cleanup on unmount
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)

    try {
      // If there's a waiting service worker, tell it to skip waiting
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        // Wait for the service worker to activate and claim clients
        await new Promise((resolve) => {
          const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
            resolve(void 0)
          }
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
          
          // Timeout after 3 seconds if controller doesn't change
          setTimeout(() => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
            resolve(void 0)
          }, 3000)
        })

        // Clear all caches to ensure fresh content
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map((name) => caches.delete(name)))
        }

        // Reload the page to use the new version
        window.location.reload()
      } else {
        // If no waiting worker, just reload to check for updates
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating:', error)
      setIsUpdating(false)
      // Fallback: just reload
      window.location.reload()
    }
  }

  const handleLater = () => {
    setUpdateAvailable(false)
    // Will check again on next page load or after 60 seconds
  }

  if (!updateAvailable) {
    return null
  }

  return (
    <BottomSheet
      isOpen={updateAvailable}
      onClose={handleLater}
      title={t('updateAvailable', { defaultValue: 'Update Available' })}
      maxHeight="auto"
    >
      <div className="p-6 space-y-4">
        <p className="text-sm theme-text-secondary leading-relaxed">
          {t('updateDescription', {
            defaultValue: 'A new version of the app is available. Update now to get the latest features and improvements.',
          })}
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('updating', { defaultValue: 'Updating...' })}</span>
              </>
            ) : (
              <>
                <HiRefresh className="w-5 h-5" />
                <span>{t('updateNow', { defaultValue: 'Update Now' })}</span>
              </>
            )}
          </button>

          <button
            onClick={handleLater}
            disabled={isUpdating}
            className="w-full px-4 py-3 rounded-xl theme-bg-tertiary theme-text-secondary hover:theme-bg-hover active:scale-[0.98] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('later', { defaultValue: 'Later' })}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
