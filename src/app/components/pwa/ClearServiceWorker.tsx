'use client'

import { useEffect } from 'react'

/**
 * Component to clear service worker cache on mount
 * Add this temporarily to force cache refresh
 */
export function ClearServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister all service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
          console.log('Service Worker unregistered')
        })
      })

      // Clear all caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName)
            console.log('Cache deleted:', cacheName)
          })
        })
      }

      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      console.log('All caches cleared')

      // Reload page after a moment
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }, [])

  return null
}

