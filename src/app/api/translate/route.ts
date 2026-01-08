import { NextRequest, NextResponse } from 'next/server';
import { translate, translateBatch, isValidLocale, SupportedLocale } from '@/lib/translation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, targetLang } = body;

    // Valider la langue cible
    if (!targetLang || !isValidLocale(targetLang)) {
      return NextResponse.json(
        { error: 'Invalid target language. Supported: fr, en, he, ru, es, ar' },
        { status: 400 }
      );
    }

    // Traduction unique
    if (text && typeof text === 'string') {
      const translated = await translate(text, targetLang as SupportedLocale);
      return NextResponse.json({ translated });
    }

    // Traduction en batch
    if (texts && Array.isArray(texts)) {
      const translations = await translateBatch(texts, targetLang as SupportedLocale);
      const result = Object.fromEntries(translations);
      return NextResponse.json({ translations: result });
    }

    return NextResponse.json(
      { error: 'Missing text or texts parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
