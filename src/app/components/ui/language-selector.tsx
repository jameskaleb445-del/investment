'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { HiChevronDown } from 'react-icons/hi'
import { cn } from '@/app/lib/utils'

const languages = [
  { 
    code: 'en', 
    label: 'English', 
    flag: '🇬🇧',
    shortLabel: 'EN'
  },
  { 
    code: 'fr', 
    label: 'Français', 
    flag: '🇫🇷',
    shortLabel: 'FR'
  },
]

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setIsOpen(false)
    
    // Set cookie for locale persistence
    document.cookie = `NEXT_LOCALE=${languageCode}; path=/; max-age=31536000`
    
    // Store in sessionStorage for immediate access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('NEXT_LOCALE', languageCode)
    }
    
    // Get current path without locale prefix
    const getPathWithoutLocale = (path: string) => {
      const localePattern = new RegExp(`^/(${['en', 'fr'].join('|')})(/|$)`)
      return path.replace(localePattern, '/') || '/'
    }
    
    const pathWithoutLocale = pathname ? getPathWithoutLocale(pathname) : '/'
    
    // Build new URL with the new locale
    let newPath: string
    if (languageCode === 'en') {
      // Default locale - no prefix
      newPath = pathWithoutLocale
    } else {
      // Non-default locale - add prefix
      if (pathWithoutLocale === '/') {
        newPath = `/${languageCode}`
      } else {
        newPath = `/${languageCode}${pathWithoutLocale}`
      }
    }
    
    // Navigate to the new locale URL
    window.location.href = newPath
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="text-sm font-medium">{currentLanguage.shortLabel}</span>
          <HiChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 py-2 theme-bg-secondary theme-border border rounded-lg shadow-xl z-[100] min-w-[160px] whitespace-nowrap overflow-visible">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 pl-4 pr-4 py-2 text-left hover:theme-bg-tertiary transition-colors cursor-pointer",
                  lang.code === locale ? "theme-bg-tertiary text-[#8b5cf6]" : "theme-text-primary"
                )}
              >
                <span className="text-sm flex-shrink-0 min-w-[20px]">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#2d2d35] border border-[#3a3a44] rounded-lg text-white hover:bg-[#35353d] hover:border-[#4a4a54] transition-colors cursor-pointer"
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.shortLabel}</span>
        <HiChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 py-2 theme-bg-secondary theme-border border rounded-lg shadow-xl z-[100] min-w-[180px] whitespace-nowrap overflow-visible">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 pl-4 pr-4 py-3 text-left hover:theme-bg-tertiary transition-colors cursor-pointer",
                lang.code === locale ? "theme-bg-tertiary text-[#8b5cf6]" : "theme-text-primary"
              )}
            >
              <span className="text-base flex-shrink-0 min-w-[24px]">{lang.flag}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium">{lang.label}</span>
                <span className="text-xs theme-text-secondary">{lang.shortLabel}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
