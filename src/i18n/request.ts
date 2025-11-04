import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale = defaultLocale
  const resolvedLocale = await requestLocale

  // Priority 1: Use requestLocale from URL/header if available and valid
  if (resolvedLocale && locales.includes(resolvedLocale as Locale)) {
    locale = resolvedLocale as Locale
  } else {
    // Priority 2: Try to get locale from cookie
    try {
      const cookieStore = await cookies()
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
      if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        locale = cookieLocale as Locale
      }
    } catch (error) {
      // cookies() might not be available in all contexts
      // Silently fall back to default locale
    }
  }

  // Final validation - ensure we always have a valid locale
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }

  // Always return a locale and messages - this is required
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})

