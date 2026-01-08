'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from './TranslationContext';
import { SupportedLocale } from './types';

// Cache côté client pour éviter les appels répétés
const clientCache = new Map<string, string>();

function getCacheKey(text: string, locale: string): string {
  return `${locale}:${text}`;
}

export function useTranslation() {
  const { locale, direction, isLoading: localeLoading } = useLocale();

  // Fonction de traduction d'un texte unique
  const t = useCallback(
    async (text: string): Promise<string> => {
      // Français = pas de traduction
      if (locale === 'fr') return text;

      // Vérifier le cache client
      const cacheKey = getCacheKey(text, locale);
      if (clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey)!;
      }

      // Appeler l'API de traduction
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: locale }),
        });
        
        if (!response.ok) {
          console.error('Translation API error:', response.statusText);
          return text;
        }

        const data = await response.json();
        const translated = data.translated || text;

        // Mettre en cache côté client
        clientCache.set(cacheKey, translated);

        return translated;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      }
    },
    [locale]
  );

  return {
    t,
    locale,
    direction,
    isLoading: localeLoading,
  };
}

// Hook pour traduction synchrone avec état
export function useTranslatedText(text: string): string {
  const { locale } = useLocale();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    // Français = pas de traduction
    if (locale === 'fr') {
      setTranslated(text);
      return;
    }

    const cacheKey = getCacheKey(text, locale);
    if (clientCache.has(cacheKey)) {
      setTranslated(clientCache.get(cacheKey)!);
      return;
    }

    // Traduire via API
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: locale }),
    })
      .then(res => res.json())
      .then(data => {
        const result = data.translated || text;
        clientCache.set(cacheKey, result);
        setTranslated(result);
      })
      .catch(error => {
        console.error('Translation error:', error);
        setTranslated(text);
      });
  }, [text, locale]);

  return translated;
}

// Hook pour attributs HTML (placeholder, alt, title, etc.)
export function useTranslatedAttr(text: string): string {
  return useTranslatedText(text);
}
