/**
 * Service de traduction utilisant Google Cloud Translation API v2 (REST)
 * Compatible avec Vercel - utilise fetch() avec une clé API
 */

const API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Supprime les voyelles (Nikkud) de l'hébreu pour un affichage professionnel
 * Les voyelles hébraïques sont dans les plages Unicode \u0591-\u05C7
 */
function removeHebrewVowels(text: string): string {
  // Plage Unicode des voyelles et signes de ponctuation hébraïques
  // \u0591-\u05BD: voyelles et accents
  // \u05BF: Rafé (rare)
  // \u05C0: Paseq
  // \u05C1-\u05C2: Shin et Sin dots
  // \u05C3: Sof Pasuq
  // \u05C4-\u05C5: Upper et Lower dots (rare)
  // \u05C7: Qamats Qatan
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// Mapper les codes de langue vers Google Cloud Translation
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'en': 'en',
  'he': 'he',
  'fr': 'fr',
  'ru': 'ru',
  'es': 'es',
  'ar': 'ar',
};

/**
 * Traduire un texte avec Google Cloud Translation API
 */
export async function translateWithGoogle(
  text: string,
  targetLang: string
): Promise<string> {
  // Pas de traduction nécessaire pour le français
  if (targetLang === 'fr') {
    return text;
  }

  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;

  // #region agent log
  const fs = require('fs');
  fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'google-translation-service.ts:entry',message:'translateWithGoogle called',data:{text:text.substring(0,30),targetLang,hasApiKey:!!apiKey},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})+'\n');
  // #endregion

  if (!apiKey) {
    console.error('GOOGLE_CLOUD_TRANSLATION_API_KEY non configurée');
    return text; // Retourner le texte original en cas d'erreur
  }

  const targetLanguageCode = LANGUAGE_CODE_MAP[targetLang] || 'en';

  try {
    const response = await fetch(
      `${API_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'fr',
          target: targetLanguageCode,
          format: 'text',
        }),
      }
    );

    // #region agent log
    fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'google-translation-service.ts:response',message:'API response status',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})+'\n');
    // #endregion

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // #region agent log
      fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'google-translation-service.ts:error',message:'API error',data:{status:response.status,error:errorData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})+'\n');
      // #endregion
      console.error('Google Cloud Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return text; // Retourner le texte original en cas d'erreur
    }

    const data = await response.json();
    
    // #region agent log
    fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'google-translation-service.ts:data',message:'API data received',data:{hasTranslations:!!data?.data?.translations,translatedText:data?.data?.translations?.[0]?.translatedText?.substring(0,30)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})+'\n');
    // #endregion
    
    // Structure de la réponse Google Cloud Translation API v2
    if (data?.data?.translations && data.data.translations.length > 0) {
      let translatedText = data.data.translations[0].translatedText || text;
      
      // Nettoyer l'hébreu : supprimer les voyelles (Nikkud) pour un affichage professionnel
      if (targetLang === 'he') {
        translatedText = removeHebrewVowels(translatedText);
      }
      
      return translatedText;
    }

    console.error('Réponse invalide de Google Cloud Translation API:', data);
    return text;
  } catch (error) {
    // #region agent log
    fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'google-translation-service.ts:catch',message:'Exception caught',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})+'\n');
    // #endregion
    console.error('Erreur lors de la traduction:', error);
    return text; // Retourner le texte original en cas d'erreur
  }
}

/**
 * Traduire plusieurs textes en batch
 */
export async function translateBatchWithGoogle(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  // Pas de traduction nécessaire pour le français
  if (targetLang === 'fr') {
    return texts;
  }

  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_CLOUD_TRANSLATION_API_KEY non configurée');
    return texts; // Retourner les textes originaux
  }

  const targetLanguageCode = LANGUAGE_CODE_MAP[targetLang] || 'en';

  try {
    const response = await fetch(
      `${API_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: texts,
          source: 'fr',
          target: targetLanguageCode,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Cloud Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return texts; // Retourner les textes originaux
    }

    const data = await response.json();
    
    if (data?.data?.translations && Array.isArray(data.data.translations)) {
      return data.data.translations.map((translation: any) => {
        let translatedText = translation.translatedText || '';
        
        // Nettoyer l'hébreu : supprimer les voyelles (Nikkud) pour un affichage professionnel
        if (targetLang === 'he') {
          translatedText = removeHebrewVowels(translatedText);
        }
        
        return translatedText;
      });
    }

    console.error('Réponse invalide de Google Cloud Translation API:', data);
    return texts;
  } catch (error) {
    console.error('Erreur lors de la traduction batch:', error);
    return texts; // Retourner les textes originaux
  }
}

