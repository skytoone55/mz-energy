'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES, getDirection } from './types';

interface TranslationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  direction: 'ltr' | 'rtl';
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'mz-energy-locale';

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  // Charger la locale depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale;
      if (stored && SUPPORTED_LOCALES.includes(stored)) {
        setLocaleState(stored);
      }
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour la locale
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      
      // Mettre à jour les attributs HTML
      document.documentElement.lang = newLocale;
      document.documentElement.dir = getDirection(newLocale);
    }
  }, []);

  // Mettre à jour le HTML au changement de locale
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      document.documentElement.lang = locale;
      document.documentElement.dir = getDirection(locale);
    }
  }, [locale, isLoading]);

  const value: TranslationContextType = {
    locale,
    setLocale,
    direction: getDirection(locale),
    isLoading,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useLocale must be used within a TranslationProvider');
  }
  return context;
}
