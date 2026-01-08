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
  
  // S'assurer que text est bien une string, convertir si nécessaire
  const textStr = typeof text === 'string' ? text : (text?.toString() || '');
  const [translated, setTranslated] = useState(textStr);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // S'assurer que text est bien une string
    const safeText = typeof text === 'string' ? text : (text?.toString() || '');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/737c270c-19c0-4819-bbc2-3ceb8f9a5656',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTranslation.ts:useEffect',message:'useEffect triggered',data:{text:safeText.substring(0,30),locale},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(()=>{});
    // #endregion

    if (locale === 'fr') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/737c270c-19c0-4819-bbc2-3ceb8f9a5656',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTranslation.ts:fr-branch',message:'locale is fr, returning original',data:{text:safeText.substring(0,30)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setTranslated(safeText);
      return;
    }

    const cacheKey = getCacheKey(safeText, locale);
    if (clientCache.has(cacheKey)) {
      // #region agent log
      const cached = clientCache.get(cacheKey);
      fetch('http://127.0.0.1:7242/ingest/737c270c-19c0-4819-bbc2-3ceb8f9a5656',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTranslation.ts:cache-hit',message:'cache hit',data:{text:safeText.substring(0,30),locale,cached:cached?.substring(0,30)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setTranslated(cached!);
      return;
    }

    setIsLoading(true);

    // Traduire via API
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: safeText, targetLang: locale }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Translation failed: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        // #region agent log
        const translatedResult = data.translated || safeText;
        fetch('http://127.0.0.1:7242/ingest/737c270c-19c0-4819-bbc2-3ceb8f9a5656',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTranslation.ts:api-response',message:'API response received',data:{text:safeText.substring(0,30),locale,translated:typeof translatedResult === 'string' ? translatedResult.substring(0,30) : String(translatedResult).substring(0,30)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const result = data.translated || safeText;
        clientCache.set(cacheKey, result);
        setTranslated(result);
      })
      .catch(error => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/737c270c-19c0-4819-bbc2-3ceb8f9a5656',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTranslation.ts:api-error',message:'API error',data:{text:safeText.substring(0,30),locale,error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Translation error:', error);
        setTranslated(safeText);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [text, locale]);

  return translated;
}

// Hook pour attributs HTML (placeholder, alt, title, etc.)
export function useTranslatedAttr(text: string): string {
  return useTranslatedText(text);
}

