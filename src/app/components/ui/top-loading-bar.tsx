'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import nprogress from 'nprogress'
import '@/app/styles/nprogress.css'

export function TopLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Configure nprogress with YouTube-like settings
    nprogress.configure({
      showSpinner: false,
      trickleSpeed: 100,
      minimum: 0.08,
      easing: 'ease',
      speed: 400,
      parent: 'body',
    })
  }, [])

  useEffect(() => {
    // Start loading when route changes
    nprogress.start()

    // Complete loading after navigation
    const timer = setTimeout(() => {
      nprogress.done()
    }, 300)

    return () => {
      clearTimeout(timer)
      nprogress.done()
    }
  }, [pathname, searchParams])

  return null
}

