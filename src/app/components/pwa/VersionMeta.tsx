'use client'

import { useEffect } from 'react'

export function VersionMeta() {
  useEffect(() => {
    // Generate or get version
    const appVersion = process.env.NEXT_PUBLIC_BUILD_TIME || Date.now().toString()
    
    // Check if meta tag already exists
    let metaTag = document.querySelector('meta[name="app-version"]')
    
    if (!metaTag) {
      // Create and inject meta tag
      metaTag = document.createElement('meta')
      metaTag.setAttribute('name', 'app-version')
      document.head.appendChild(metaTag)
    }
    
    // Update content
    metaTag.setAttribute('content', appVersion)
  }, [])

  return null
}

