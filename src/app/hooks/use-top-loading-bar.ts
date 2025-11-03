'use client'

import { useEffect, useRef } from 'react'
import nprogress from 'nprogress'
import '@/app/styles/nprogress.css'

export function useTopLoadingBar(isLoading: boolean) {
  const configuredRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Configure nprogress only once globally
    if (!configuredRef.current) {
      nprogress.configure({
        showSpinner: false,
        trickleSpeed: 100,
        minimum: 0.08,
        easing: 'ease',
        speed: 400,
        parent: 'body',
      })
      configuredRef.current = true
    }

    if (isLoading) {
      // Reset any existing progress
      nprogress.remove()
      
      // Start loading - this creates the bar element
      nprogress.start()
      
      // Set initial progress after a short delay to ensure bar exists
      setTimeout(() => {
        const bar = document.querySelector('#nprogress .bar') as HTMLElement
        if (bar) {
          bar.style.width = '10%'
          nprogress.set(0.1)
        }
      }, 50)
      
      // Progress smoothly up to 85% then wait for actual completion
      let progress = 0.1
      intervalRef.current = setInterval(() => {
        progress += 0.025 // Increment by 2.5% each time
        if (progress < 0.85) { // Progress up to 85%
          nprogress.set(progress)
          // Also set directly on DOM as backup
          const bar = document.querySelector('#nprogress .bar') as HTMLElement
          if (bar) {
            bar.style.width = `${(progress * 100).toFixed(0)}%`
          }
        } else {
          // Stop at 85%, wait for data to load
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Ensure it's set to 85% and hold there
          nprogress.set(0.85)
          const bar = document.querySelector('#nprogress .bar') as HTMLElement
          if (bar) {
            bar.style.width = '85%'
          }
        }
      }, 120)
    } else {
      // Stop the interval immediately
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // When loading completes, force complete to 100% then hide
      // Don't check isStarted() - just force complete it
      const completeBar = () => {
        // Always try to set to 100%, regardless of isStarted()
        nprogress.set(1)
        
        // Force set on DOM element
        const bar = document.querySelector('#nprogress .bar') as HTMLElement
        if (bar) {
          bar.style.width = '100%'
          bar.style.maxWidth = '100%'
          bar.style.transition = 'width 0.2s ease-out'
          // Force a reflow to ensure the width is applied
          bar.offsetHeight
        } else {
          // If bar doesn't exist, start nprogress and then set it
          nprogress.start()
          setTimeout(() => {
            const bar = document.querySelector('#nprogress .bar') as HTMLElement
            if (bar) {
              bar.style.width = '100%'
            }
          }, 10)
        }
        
        // Try again after a micro delay
        requestAnimationFrame(() => {
          const bar = document.querySelector('#nprogress .bar') as HTMLElement
          if (bar) {
            bar.style.width = '100%'
            bar.style.maxWidth = '100%'
          }
          nprogress.set(1)
        })
      }
      
      // Always try to complete, even if isStarted() is false
      completeBar()
      
      // Also try after a small delay
      setTimeout(() => {
        completeBar()
      }, 10)
      
      // Show 100% briefly, then hide
      setTimeout(() => {
        // Final check before hiding
        const bar = document.querySelector('#nprogress .bar') as HTMLElement
        if (bar) {
          bar.style.width = '100%'
          bar.style.maxWidth = '100%'
        }
        nprogress.set(1)
        nprogress.done()
      }, 500)
    }

    return () => {
      // Cleanup intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // If unmounting while loading, complete it
      if (isLoading && nprogress.isStarted()) {
        nprogress.done()
      }
    }
  }, [isLoading])
}

