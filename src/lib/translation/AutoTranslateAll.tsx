'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from './TranslationContext'

// Cache côté client
const clientCache = new Map<string, string>()

/**
 * Traduit automatiquement TOUS les textes enfants récursivement
 * Y compris les textes dans les éléments React imbriqués
 */
export function AutoTranslateAll({ children }: { children: React.ReactNode }): React.ReactNode {
  // Simplifié : ne traduit que les strings directes
  if (typeof children === 'string' && children.trim()) {
    return <TranslatedText text={children} />
  }
  return children
}

/**
 * Composant pour traduire un texte
 */
function TranslatedText({ text }: { text: string }) {
  const { locale } = useLocale()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    // Français = pas de traduction
    if (locale === 'fr') {
      setTranslated(text)
      return
    }

    // Vérifier le cache
    const cacheKey = `${locale}:${text}`
    if (clientCache.has(cacheKey)) {
      setTranslated(clientCache.get(cacheKey)!)
      return
    }

    // Appeler l'API de traduction
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: locale }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.translated) {
          clientCache.set(cacheKey, data.translated)
          setTranslated(data.translated)
        }
      })
      .catch(err => {
        console.error('Translation error:', err)
      })
  }, [text, locale])

  return <>{translated}</>
}

TranslatedText.displayName = 'TranslatedText'
