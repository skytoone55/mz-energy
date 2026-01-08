import { NextRequest, NextResponse } from 'next/server';
import { translate, translateBatch, isValidLocale, SupportedLocale } from '@/lib/translation';
import * as fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, targetLang } = body;

    // #region agent log
    fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'api/translate/route.ts:entry',message:'API route called',data:{text:text?.substring(0,30),targetLang},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})+'\n');
    // #endregion

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
      // #region agent log
      fs.appendFileSync('/Users/john/JARVIS/.cursor/debug.log', JSON.stringify({location:'api/translate/route.ts:result',message:'translate() returned',data:{original:text.substring(0,30),translated:translated.substring(0,30),same:text===translated},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})+'\n');
      // #endregion
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

