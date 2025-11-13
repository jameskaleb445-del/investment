'use client'

import { useEffect, useState, useRef } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { useTranslations } from 'next-intl'
import { HiRefresh } from 'react-icons/hi'

const VERSION_KEY = 'app-version'
const VERSION_STORAGE_KEY = 'cached-app-version'

// Get current app version from meta tag or use timestamp
function getCurrentVersion(): string {
  if (typeof document === 'undefined') return Date.now().toString()
  
  const metaTag = document.querySelector('meta[name="app-version"]')
  if (metaTag) {
    return metaTag.getAttribute('content') || Date.now().toString()
  }
  
  // Fallback: use page load timestamp
  return Date.now().toString()
}

// Check if there's a version mismatch by comparing with network
async function checkVersionMismatch(): Promise<boolean> {
  try {
    // Fetch version from API endpoint (bypass cache)
    const response = await fetch('/api/version', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })
    
    if (!response.ok) return false
    
    const data = await response.json()
    const networkVersion = data.version
    const cachedVersion = localStorage.getItem(VERSION_STORAGE_KEY)
    
    // If versions don't match, there's an update
    return cachedVersion !== null && networkVersion !== cachedVersion
  } catch (error) {
    console.error('Error checking version:', error)
    return false
  }
}

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [pendingRefresh, setPendingRefresh] = useState(false)
  const t = useTranslations('common')
  const refreshIntercepted = useRef(false)

  // Check for version mismatch on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check network version on mount
    checkVersionMismatch().then((hasMismatch) => {
      if (hasMismatch) {
        setUpdateAvailable(true)
      } else {
        // Fetch and store current version
        fetch('/api/version', { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => {
            localStorage.setItem(VERSION_STORAGE_KEY, data.version)
          })
          .catch(() => {
            // Fallback to current version from meta tag
            const currentVersion = getCurrentVersion()
            localStorage.setItem(VERSION_STORAGE_KEY, currentVersion)
          })
      }
    })
  }, [])

  // Intercept refresh actions
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Only intercept if we haven't already shown the prompt
      if (refreshIntercepted.current || updateAvailable) return

      // Check for version mismatch before refresh
      const hasMismatch = await checkVersionMismatch()
      if (hasMismatch) {
        e.preventDefault()
        e.returnValue = ''
        setPendingRefresh(true)
        setUpdateAvailable(true)
        refreshIntercepted.current = true
      }
    }

    // Intercept keyboard refresh (F5, Ctrl+R, Cmd+R)
    const handleKeyDown = async (e: KeyboardEvent) => {
      // F5 or Ctrl+R / Cmd+R
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        if (refreshIntercepted.current || updateAvailable) return

        const hasMismatch = await checkVersionMismatch()
        if (hasMismatch) {
          e.preventDefault()
          setPendingRefresh(true)
          setUpdateAvailable(true)
          refreshIntercepted.current = true
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [updateAvailable])

  // Service worker update detection
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let updateInterval: NodeJS.Timeout | null = null

    // Check for existing service worker registration
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
        const newWorker = reg.installing
        if (!newWorker) return

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
      const handleControllerChange = () => {
        // Reload if a new service worker has taken control
        if (navigator.serviceWorker.controller) {
          window.location.reload()
        }
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
        // Wait a bit for the service worker to activate
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }

      // Fetch and store the new version before reloading
      try {
        const versionResponse = await fetch('/api/version', { cache: 'no-store' })
        const versionData = await versionResponse.json()
        localStorage.setItem(VERSION_STORAGE_KEY, versionData.version)
      } catch (error) {
        // If version fetch fails, just clear it - it will be set on next load
        localStorage.removeItem(VERSION_STORAGE_KEY)
      }

      // Reload the page to use the new version
      window.location.reload()
    } catch (error) {
      console.error('Error updating:', error)
      setIsUpdating(false)
      // Fallback: just reload
      window.location.reload()
    }
  }

  const handleLater = async () => {
    setUpdateAvailable(false)
    setPendingRefresh(false)
    refreshIntercepted.current = false
    
    // Fetch and store current network version to prevent immediate re-prompt
    try {
      const response = await fetch('/api/version', { cache: 'no-store' })
      const data = await response.json()
      localStorage.setItem(VERSION_STORAGE_KEY, data.version)
    } catch (error) {
      // Fallback to current version from meta tag
      const currentVersion = getCurrentVersion()
      localStorage.setItem(VERSION_STORAGE_KEY, currentVersion)
    }
  }

  return (
    <BottomSheet
      isOpen={updateAvailable}
      onClose={handleLater}
      title={t('updateAvailable')}
      maxHeight="auto"
    >
      <div className="p-6 space-y-4">
        <p className="text-sm theme-text-secondary leading-relaxed">
          {t('updateDescription')}
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
                <span>{t('updating')}</span>
              </>
            ) : (
              <>
                <HiRefresh className="w-5 h-5" />
                <span>{t('updateNow')}</span>
              </>
            )}
          </button>

          <button
            onClick={handleLater}
            disabled={isUpdating}
            className="w-full px-4 py-3 rounded-xl theme-bg-tertiary theme-text-secondary hover:theme-bg-hover active:scale-[0.98] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('later')}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

