'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { HiTranslate } from 'react-icons/hi'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export function LanguageSelector() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (value: string) => {
    // Set cookie for locale persistence
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000`
    
    // Store in sessionStorage for immediate access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('NEXT_LOCALE', value)
    }
    
    // Get current path without locale prefix
    const getPathWithoutLocale = (path: string) => {
      const localePattern = new RegExp(`^/(${['en', 'fr'].join('|')})(/|$)`)
      return path.replace(localePattern, '/') || '/'
    }
    
    const pathWithoutLocale = pathname ? getPathWithoutLocale(pathname) : '/'
    
    // Build new URL with the new locale
    let newPath: string
    if (value === 'en') {
      // Default locale - no prefix
      newPath = pathWithoutLocale
    } else {
      // Non-default locale - add prefix
      if (pathWithoutLocale === '/') {
        newPath = `/${value}`
      } else {
        newPath = `/${value}${pathWithoutLocale}`
      }
    }
    
    // Navigate to the new locale URL
    window.location.href = newPath
  }

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  return (
    <div className="flex items-center gap-2">
      <HiTranslate className="w-5 h-5 theme-text-secondary" />
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] theme-bg-tertiary theme-border-secondary theme-text-primary h-9">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span className="text-sm">{currentLanguage.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="theme-bg-secondary theme-border">
          {languages.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="theme-text-primary hover:theme-bg-tertiary cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

