'use client'

import { useEffect } from 'react'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getDirection, type SupportedLocale } from '@/lib/translation/types'

/**
 * Composant qui initialise les attributs lang et dir sur l'élément <html>
 * avant même que le TranslationProvider ne soit monté, pour éviter un flash
 */
export function HtmlLangInit() {
  useEffect(() => {
    // Vérifier la locale stockée de manière synchrone (côté client uniquement)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mz-energy-locale') as SupportedLocale
      const locale = stored && SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
      const direction = getDirection(locale)
      
      document.documentElement.lang = locale
      document.documentElement.dir = direction
    }
  }, [])

  return null
}

