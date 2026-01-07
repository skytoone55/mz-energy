import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route pour renommer une simulation
 * PATCH /api/simulation/[id]/rename
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { nomProjet } = body
    
    if (nomProjet !== undefined && typeof nomProjet !== 'string' && nomProjet !== null) {
      return NextResponse.json(
        { error: 'nomProjet doit être une chaîne de caractères ou null' },
        { status: 400 }
      )
    }
    
    // Vérifier que la simulation existe
    const { data: existingSim, error: fetchError } = await supabase
      .from('simulations')
      .select('id, user_id, lead_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingSim) {
      return NextResponse.json(
        { error: 'Simulation non trouvée' },
        { status: 404 }
      )
    }
    
    // Vérifier que l'utilisateur est le propriétaire, admin, ou commercial avec accès
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 403 }
      )
    }
    
    const isAdmin = profile.role === 'admin'
    const isOwner = existingSim.user_id === user.id
    
    if (!isAdmin && !isOwner) {
      // Si c'est une simulation de particulier (lead_id existe), seul l'admin peut la modifier
      if (existingSim.lead_id && !isAdmin) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }
      
      // Si c'est une simulation commerciale, seul le propriétaire peut la modifier
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }
    }
    
    // Mettre à jour uniquement le nom
    const { error: updateError } = await supabase
      .from('simulations')
      .update({
        nom_projet: nomProjet || null,
      })
      .eq('id', id)
    
    if (updateError) {
      console.error('Erreur mise à jour nom simulation:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      nomProjet: nomProjet || null,
    })
    
  } catch (error) {
    console.error('Erreur API rename simulation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

