import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * PATCH /api/simulation/[id]/contact
 * Mettre à jour uniquement le contact_id d'une simulation
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
    
    // Vérifier que la simulation existe et appartient à l'utilisateur
    const { data: existingSim, error: fetchError } = await supabase
      .from('simulations')
      .select('id, user_id, type')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingSim) {
      return NextResponse.json(
        { error: 'Simulation non trouvée' },
        { status: 404 }
      )
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
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
    
    if (existingSim.user_id !== user.id && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { contactId } = body
    
    if (contactId === undefined) {
      return NextResponse.json(
        { error: 'contactId est requis' },
        { status: 400 }
      )
    }
    
    // Vérifier que le contact existe et appartient au commercial (si fourni)
    if (contactId !== null) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('id, commercial_id')
        .eq('id', contactId)
        .single()
      
      if (!contact) {
        return NextResponse.json(
          { error: 'Contact non trouvé' },
          { status: 404 }
        )
      }
      
      // Vérifier les permissions sur le contact
      if (profile.role !== 'admin' && contact.commercial_id !== user.id) {
        return NextResponse.json(
          { error: 'Contact non autorisé' },
          { status: 403 }
        )
      }
    }
    
    // Utiliser le client admin pour la mise à jour
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Mettre à jour uniquement le contact_id
    const { data: updatedSimulation, error: updateError } = await adminSupabase
      .from('simulations')
      .update({ contact_id: contactId })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Erreur mise à jour contact:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      simulation: updatedSimulation,
    })
    
  } catch (error) {
    console.error('Erreur API simulation contact PATCH:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
