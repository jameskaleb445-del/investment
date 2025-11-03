'use client'

import { useEffect } from 'react'
import nprogress from 'nprogress'

export function LoadingBarTest() {
  useEffect(() => {
    // Configure nprogress - ensure parent is body
    nprogress.configure({
      showSpinner: false,
      trickleSpeed: 80,
      minimum: 0.08,
      easing: 'ease',
      speed: 300,
      parent: 'body',
    })
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      nprogress.set(0)
      nprogress.start()
      
      let progress = 0
      const interval = setInterval(() => {
        progress += 0.02
        if (progress >= 0.95) {
          progress = 0
          nprogress.set(0)
        } else {
          nprogress.set(progress)
        }
      }, 50)
      
      // Store interval for cleanup
      ;(window as any).__nprogressInterval = interval
    }, 100)
    
    return () => {
      if ((window as any).__nprogressInterval) {
        clearInterval((window as any).__nprogressInterval)
      }
      nprogress.done()
    }
  }, [])

  return null
}
