'use client'

import React, { useState, useEffect } from 'react'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import { HiX, HiDownload } from 'react-icons/hi'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user has previously dismissed the prompt (using localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault()
      
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show our custom prompt if user hasn't dismissed it in the last week
      if (dismissedTime < oneWeekAgo) {
        // Small delay to ensure smooth page load
        setTimeout(() => {
          setShowPrompt(true)
        }, 5000) // Show after 5 seconds
      } else {
        // If recently dismissed, check if we're in dev mode and show anyway (for testing)
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        if (isDev && dismissedTime < Date.now() - 1000 * 60 * 60) { // If dismissed more than 1 hour ago in dev
          setTimeout(() => {
            setShowPrompt(true)
          }, 8000)
        }
      }
    }

    // Listen for app installation
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app was successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    })

    // For iOS Safari or dev mode: Show prompt after delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    let devTimeout: NodeJS.Timeout | null = null
    
    // In dev mode, always show prompt after delay for testing (even without beforeinstallprompt)
    if (isDev && dismissedTime < oneWeekAgo) {
      devTimeout = setTimeout(() => {
        // Check again if not installed
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPrompt(true)
          // In dev mode, we'll show the prompt but with a message that real install requires HTTPS
        }
      }, 3000) // Show after 3 seconds in dev mode for faster testing
    } else if (isIOS && dismissedTime < oneWeekAgo) {
      devTimeout = setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPrompt(true)
        }
      }, 8000) // Show after 8 seconds on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (devTimeout) clearTimeout(devTimeout)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for user's response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowPrompt(false)
      setIsInstalled(true)
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Save dismissal timestamp
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed (check in useEffect, not during render)
  if (isInstalled) {
    return null
  }

  // For iOS Safari, show custom instructions (only render client-side)
  if (typeof window !== 'undefined') {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    if (isStandalone) {
      return null
    }

    // For iOS Safari, show custom instructions
    if (isIOS && !deferredPrompt) {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      
      if (dismissedTime < oneWeekAgo && showPrompt) {
      return (
        <BottomSheet isOpen={showPrompt} onClose={handleDismiss}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
                  <HiDownload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Install App</h3>
                  <p className="text-xs text-[#a0a0a8]">Add to Home Screen</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-[#a0a0a8] hover:text-white transition-colors cursor-pointer"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div className="bg-[#2d2d35] rounded-lg p-4">
                <p className="text-sm font-medium text-white mb-2">How to install:</p>
                <ol className="text-xs text-[#a0a0a8] space-y-2 list-decimal list-inside">
                  <li>Tap the Share button <span className="inline-block w-4 h-4 bg-white/20 rounded mx-1">⎋</span> at the bottom</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full border-[#2d2d35] text-[#a0a0a8] hover:text-white hover:border-[#3a3a44]"
            >
              Got it
            </Button>
          </div>
        </BottomSheet>
      )
      }
    }
  }

  // Don't show if prompt not triggered
  if (!showPrompt) {
    return null
  }

  // Check if we're in dev mode (localhost) without a real prompt
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const isDevMode = isDev && !deferredPrompt

  return (
    <BottomSheet isOpen={showPrompt} onClose={handleDismiss}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
              <HiDownload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Install App</h3>
              <p className="text-xs text-[#a0a0a8]">Get the full experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#a0a0a8] hover:text-white transition-colors cursor-pointer"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-2"></div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Fast & Smooth</p>
              <p className="text-xs text-[#a0a0a8]">
                Enjoy a faster, more seamless experience with the installed app
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-2"></div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Offline Access</p>
              <p className="text-xs text-[#a0a0a8]">
                Access your investments even when offline
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-2"></div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Quick Access</p>
              <p className="text-xs text-[#a0a0a8]">
                Launch directly from your home screen
              </p>
            </div>
          </div>
        </div>

        {isDevMode ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-[#2d2d35] border border-[#3a3a44]">
              <p className="text-sm text-[#a0a0a8] mb-2">
                <span className="font-medium text-white">⚠️ Development Mode:</span>
              </p>
              <p className="text-xs text-[#a0a0a8]">
                Install prompts require HTTPS. Deploy to production (Vercel, Netlify, etc.) to enable installation.
              </p>
            </div>
            <Button
              onClick={handleDismiss}
              className="w-full border-[#2d2d35] text-[#a0a0a8] hover:text-white hover:border-[#3a3a44]"
            >
              Got it
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
            >
              <HiDownload className="w-5 h-5 mr-2" />
              Install Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 border-[#2d2d35] text-[#a0a0a8] hover:text-white hover:border-[#3a3a44]"
            >
              Maybe Later
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

