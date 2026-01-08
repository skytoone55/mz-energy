import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fonction pour supprimer les voyelles hébraïques
function removeHebrewVowels(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanHebrew = searchParams.get('cleanHebrew') === 'true';
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (cleanHebrew) {
      // Nettoyer spécifiquement le cache hébreu : lire, nettoyer, remettre
      const { data: hebrewTranslations, error: fetchError } = await supabase
        .from('translations_cache')
        .select('*')
        .eq('target_lang', 'he');

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      if (!hebrewTranslations || hebrewTranslations.length === 0) {
        return NextResponse.json({ 
          success: true, 
          message: 'No Hebrew translations found in cache' 
        });
      }

      // Nettoyer chaque traduction et la mettre à jour
      const cleanedTranslations = hebrewTranslations.map(item => ({
        id: item.id,
        source_hash: item.source_hash,
        source_text: item.source_text,
        source_lang: item.source_lang,
        target_lang: item.target_lang,
        translated_text: removeHebrewVowels(item.translated_text),
      }));

      // Mettre à jour le cache avec les traductions nettoyées
      const { error: updateError } = await supabase
        .from('translations_cache')
        .upsert(cleanedTranslations, {
          onConflict: 'id'
        });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Cleaned ${cleanedTranslations.length} Hebrew translations (removed vowels)` 
      });
    } else {
      // Nettoyer tout le cache
      const { error } = await supabase
        .from('translations_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Cache cleared successfully' });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

