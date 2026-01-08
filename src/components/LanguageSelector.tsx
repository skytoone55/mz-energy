'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/lib/translation/TranslationContext';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/translation/types';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES: Record<SupportedLocale, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  he: { label: 'עברית', flag: '🇮🇱' },
  fr: { label: 'Français', flag: '🇫🇷' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  es: { label: 'Español', flag: '🇪🇸' },
  ar: { label: 'العربية', flag: '🇸🇦' },
};

export default function LanguageSelector() {
  const { locale, setLocale, direction } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES[locale];

  // Fermer si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden sm:inline text-sm font-medium">{currentLang.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-50",
            direction === 'rtl' ? 'left-0' : 'right-0'
          )}
          role="listbox"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => handleSelect(loc)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                loc === locale 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-700 dark:text-gray-300'
              )}
              role="option"
              aria-selected={loc === locale}
            >
              <span className="text-xl">{LANGUAGES[loc].flag}</span>
              <span className="font-medium">{LANGUAGES[loc].label}</span>
              {loc === locale && (
                <svg
                  className="h-4 w-4 ms-auto text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

