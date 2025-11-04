// Shared configuration that can be used in both server and client components
export const locales = ['en', 'fr', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

