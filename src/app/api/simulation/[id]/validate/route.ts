import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * POST /api/simulation/[id]/validate
 * Valider une simulation (passer en statut 'validee')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 403 })
    }

    const isAdmin = profile.role === 'admin'

    // Vérifier que la simulation existe et les permissions
    const { data: simulation } = await supabase
      .from('simulations')
      .select('id, user_id, statut')
      .eq('id', id)
      .single()

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (!isAdmin && simulation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
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

    // Mettre à jour le statut
    const { data: updatedSimulation, error: updateError } = await adminSupabase
      .from('simulations')
      .update({
        statut: 'validee',
        validated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur validation simulation:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la validation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      simulation: updatedSimulation,
    })
  } catch (error) {
    console.error('Erreur API validation simulation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
