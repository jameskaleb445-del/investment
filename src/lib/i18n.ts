'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export function useLanguage() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = async (newLocale: string) => {
    // Set cookie for locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    
    // Remove current locale from pathname if present
    const pathWithoutLocale = pathname.replace(/^\/(en|fr|es)/, '') || '/'
    
    // Add new locale to path (only if not 'en')
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`
    
    router.push(newPath)
    router.refresh()
  }

  return {
    locale,
    changeLanguage
  }
}

