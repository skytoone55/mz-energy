'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from './TranslationContext'

// Cache côté client
const clientCache = new Map<string, string>()

/**
 * Helper pour traduire automatiquement les children d'un composant
 * SIMPLIFIÉ : Ne traduit que les strings directes, ne modifie pas les éléments React
 */
export function AutoTranslate({ children }: { children: React.ReactNode }): React.ReactNode {
  // Si children est une string simple, la traduire
  if (typeof children === 'string' && children.trim()) {
    return <TranslatedText text={children} />
  }
  
  // Sinon, retourner tel quel (pas de modification des éléments React)
  return children
}

/**
 * Composant simple pour traduire un texte
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
