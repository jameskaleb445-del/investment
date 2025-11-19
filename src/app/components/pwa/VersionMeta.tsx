'use client'

import { useEffect } from 'react'

export function VersionMeta() {
  useEffect(() => {
    // Set version in meta tag for client-side reference
    // Uses build-time version or generates one
    const version = process.env.NEXT_PUBLIC_APP_VERSION || 
                   process.env.NEXT_PUBLIC_BUILD_TIME || 
                   Date.now().toString()
    
    // Remove existing version meta tag if any
    const existingMeta = document.querySelector('meta[name="app-version"]')
    if (existingMeta) {
      existingMeta.remove()
    }
    
    // Create and add new meta tag
    const metaTag = document.createElement('meta')
    metaTag.name = 'app-version'
    metaTag.content = version
    document.head.appendChild(metaTag)
  }, [])

  return null
}
