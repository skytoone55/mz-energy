import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route pour le formulaire de contact
 * POST /api/contact
 * 
 * Crée un lead dans la table "leads" avec source "contact_form"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prenom, nom, email, telephone, type, sujet, message } = body

    // Validation basique
    if (!prenom || !nom || !email || !telephone || !type || !sujet || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Créer un lead avec les infos de contact
    const { data, error } = await supabase
      .from('leads')
      .insert({
        prenom,
        nom,
        email,
        telephone,
        source: 'contact_form',
        notes: `Type: ${type}\nSujet: ${sujet}\nMessage: ${message}`,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création lead depuis formulaire contact:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Erreur API contact:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

