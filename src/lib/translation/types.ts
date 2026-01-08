/**
 * Types et constantes pour l'internationalisation
 * Ce fichier peut être importé côté client ET serveur
 */

export type SupportedLocale = 'en' | 'he' | 'fr' | 'ru' | 'es' | 'ar';

// Ordre : anglais, hébreu, français, russe, espagnol, arabe
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'he', 'fr', 'ru', 'es', 'ar'];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Vérifier si une locale est supportée
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Obtenir la direction du texte
 */
export function getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  // Hébreu et arabe sont RTL (droite à gauche)
  return locale === 'he' || locale === 'ar' ? 'rtl' : 'ltr';
}

