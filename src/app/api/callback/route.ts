import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendCallbackNotification } from '@/lib/email'

/**
 * API Route pour les demandes de rappel
 * POST /api/callback
 * 
 * Crée un lead dans la table "leads" avec source "callback" et envoie un email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prenom, telephone, type, creneau } = body

    // Validation basique
    if (!prenom || !telephone || !type) {
      return NextResponse.json(
        { error: 'Prénom, téléphone et type sont requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Créer un lead avec les infos de callback
    const { data, error } = await supabase
      .from('leads')
      .insert({
        prenom,
        nom: '', // Pas de nom pour les callbacks
        telephone,
        email: null,
        source: 'callback',
        notes: `Type: ${type}\nCrénau préféré: ${creneau || 'Peu importe'}`,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création lead depuis callback:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la demande de rappel' },
        { status: 500 }
      )
    }

    // Envoyer l'email de notification (ne pas bloquer si l'email échoue)
    try {
      await sendCallbackNotification({
        prenom,
        telephone,
        type,
        creneau,
      })
    } catch (emailError) {
      console.error('Erreur envoi email (non bloquant):', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Erreur API callback:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

