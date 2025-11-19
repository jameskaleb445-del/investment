'use client'

import { useEffect, useRef } from 'react'

export function PWARegistration() {
  const registeredRef = useRef(false)

  useEffect(() => {
    // Prevent double registration
    if (registeredRef.current) return
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope)
          registeredRef.current = true

          // Check for updates immediately and then periodically
          registration.update()

          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
