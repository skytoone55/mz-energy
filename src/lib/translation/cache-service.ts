/**
 * Service de cache des traductions dans Supabase
 */

import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Utiliser service role pour le cache côté serveur
);

/**
 * Générer un hash MD5 du texte pour la recherche rapide
 */
function hashText(text: string): string {
  return CryptoJS.MD5(text).toString();
}

export interface CachedTranslation {
  source_text: string;
  translated_text: string;
  target_lang: string;
}

/**
 * Récupérer une traduction depuis le cache
 */
export async function getFromCache(
  text: string,
  targetLang: string
): Promise<string | null> {
  const hash = hashText(text);

  const { data, error } = await supabase
    .from('translations_cache')
    .select('translated_text')
    .eq('source_hash', hash)
    .eq('target_lang', targetLang)
    .single();

  if (error || !data) {
    return null;
  }

  return data.translated_text;
}

/**
 * Sauvegarder une traduction dans le cache
 */
export async function saveToCache(
  sourceText: string,
  targetLang: string,
  translatedText: string
): Promise<void> {
  const hash = hashText(sourceText);

  const { error } = await supabase
    .from('translations_cache')
    .upsert({
      source_hash: hash,
      source_text: sourceText,
      source_lang: 'fr',
      target_lang: targetLang,
      translated_text: translatedText,
    }, {
      onConflict: 'source_hash,target_lang'
    });

  if (error) {
    console.error('Erreur lors de la sauvegarde dans le cache:', error);
  }
}

/**
 * Récupérer plusieurs traductions en une seule requête
 */
export async function getMultipleFromCache(
  texts: string[],
  targetLang: string
): Promise<Map<string, string>> {
  const hashes = texts.map(hashText);
  const result = new Map<string, string>();

  const { data, error } = await supabase
    .from('translations_cache')
    .select('source_hash, source_text, translated_text')
    .in('source_hash', hashes)
    .eq('target_lang', targetLang);

  if (error || !data) {
    return result;
  }

  // Créer un map de hash -> texte source pour la recherche inverse
  const hashToText = new Map<string, string>();
  texts.forEach(text => {
    hashToText.set(hashText(text), text);
  });

  // Remplir le résultat avec source_text -> translated_text
  for (const item of data) {
    const sourceText = hashToText.get(item.source_hash);
    if (sourceText) {
      result.set(sourceText, item.translated_text);
    }
  }

  return result;
}

/**
 * Sauvegarder plusieurs traductions
 */
export async function saveMultipleToCache(
  translations: Array<{ source: string; target: string; lang: string }>
): Promise<void> {
  const records = translations.map(t => ({
    source_hash: hashText(t.source),
    source_text: t.source,
    source_lang: 'fr',
    target_lang: t.lang,
    translated_text: t.target,
  }));

  const { error } = await supabase
    .from('translations_cache')
    .upsert(records, {
      onConflict: 'source_hash,target_lang'
    });

  if (error) {
    console.error('Erreur lors de la sauvegarde multiple dans le cache:', error);
  }
}

