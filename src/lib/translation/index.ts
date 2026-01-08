/**
 * Service principal de traduction (SERVEUR UNIQUEMENT)
 * Gère le cache et les appels à Google Cloud Translation
 * Ne pas importer ce fichier côté client !
 */

import { translateWithGoogle, translateBatchWithGoogle } from './google-translation-service';
import { 
  getFromCache, 
  saveToCache, 
  getMultipleFromCache, 
  saveMultipleToCache 
} from './cache-service';

// Fonction pour supprimer les voyelles hébraïques
function removeHebrewVowels(text: string): string {
  // Plage Unicode des voyelles et signes de ponctuation hébraïques
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// Re-export des types pour compatibilité
export type { SupportedLocale } from './types';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, getDirection } from './types';

import { SupportedLocale } from './types';

/**
 * Traduire un texte unique
 */
export async function translate(
  text: string,
  targetLang: SupportedLocale
): Promise<string> {
  // Pas de traduction nécessaire pour le français
  if (targetLang === 'fr') {
    return text;
  }

  // Vérifier le cache d'abord
  const cached = await getFromCache(text, targetLang);
  if (cached) {
    // Appliquer le filtre hébreu même pour les traductions en cache
    if (targetLang === 'he') {
      return removeHebrewVowels(cached);
    }
    return cached;
  }

  // Traduire via Google Cloud Translation
  const translated = await translateWithGoogle(text, targetLang);

  // Sauvegarder dans le cache (async, non bloquant)
  saveToCache(text, targetLang, translated).catch(console.error);

  return translated;
}

/**
 * Traduire plusieurs textes (optimisé)
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLocale
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  // Pas de traduction nécessaire pour le français
  if (targetLang === 'fr') {
    texts.forEach(text => result.set(text, text));
    return result;
  }

  // Récupérer les traductions en cache
  const cached = await getMultipleFromCache(texts, targetLang);

  // Appliquer le filtre hébreu aux traductions en cache si nécessaire et identifier les textes à traduire
  let workingCache = cached;
  if (targetLang === 'he') {
    const cleanedCache = new Map<string, string>();
    cached.forEach((value, key) => {
      cleanedCache.set(key, removeHebrewVowels(value));
    });
    workingCache = cleanedCache;
  }

  // Identifier les textes non traduits
  const toTranslate = texts.filter(text => !workingCache.has(text));

  // Si tous sont en cache, retourner directement
  if (toTranslate.length === 0) {
    return workingCache;
  }

  // Traduire les textes manquants en batch
  const translatedTexts = await translateBatchWithGoogle(toTranslate, targetLang);

  // Construire le map complet avec cache + nouvelles traductions
  texts.forEach(text => {
    if (workingCache.has(text)) {
      result.set(text, workingCache.get(text)!);
    } else {
      const index = toTranslate.indexOf(text);
      const translated = translatedTexts[index] || text;
      result.set(text, translated);
    }
  });

  // Sauvegarder les nouvelles traductions dans le cache (async, non bloquant)
  const newTranslations: Array<{ source: string; target: string; lang: string }> = [];
  toTranslate.forEach((text, index) => {
    const translated = translatedTexts[index];
    if (translated && translated !== text) {
      newTranslations.push({ source: text, target: translated, lang: targetLang });
    }
  });

  if (newTranslations.length > 0) {
    saveMultipleToCache(newTranslations).catch(console.error);
  }

  return result;
}
