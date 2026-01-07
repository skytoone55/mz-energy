import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Helper pour vérifier que l'utilisateur est admin
 */
async function checkAdminAccess() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { authorized: false, error: 'Non authentifié', statusCode: 401 }
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Accès non autorisé', statusCode: 403 }
  }
  
  return { authorized: true, user }
}

/**
 * API Route pour récupérer tous les leads (admin only)
 * GET /api/admin/leads
 */
export async function GET() {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    const { data: leads, error: fetchError } = await adminSupabase
      .from('leads')
      .select(`
        *,
        simulations(
          id, 
          user_id,
          user_profiles:user_id(prenom, nom)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Erreur récupération leads:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }
    
    // Formater les leads pour inclure les informations de simulation et commercial
    const formattedLeads = (leads || []).map((lead: any) => {
      const simulation = lead.simulations?.[0]
      return {
        ...lead,
        simulations: undefined, // Retirer le tableau simulations
        simulationId: simulation?.id || null,
        commercialAssigne: simulation?.user_profiles 
          ? {
              id: simulation.user_id,
              prenom: simulation.user_profiles.prenom,
              nom: simulation.user_profiles.nom,
            }
          : null,
      }
    })
    
    return NextResponse.json({ leads: formattedLeads })
    
  } catch (error) {
    console.error('Erreur API admin leads GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour supprimer des leads en masse (admin only)
 * DELETE /api/admin/leads
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const body = await request.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs manquants ou invalides' }, { status: 400 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Pour chaque lead, supprimer aussi la simulation associée si elle existe
    for (const leadId of ids) {
      // Trouver la simulation associée
      const { data: simulation } = await adminSupabase
        .from('simulations')
        .select('id')
        .eq('lead_id', leadId)
        .maybeSingle()
      
      // Supprimer la simulation si elle existe
      if (simulation) {
        const { error: simDeleteError } = await adminSupabase
          .from('simulations')
          .delete()
          .eq('id', simulation.id)
        
        if (simDeleteError) {
          console.error(`Erreur suppression simulation pour lead ${leadId}:`, simDeleteError)
        }
      }
    }
    
    // Supprimer les leads
    const { error: deleteError } = await adminSupabase
      .from('leads')
      .delete()
      .in('id', ids)
    
    if (deleteError) {
      console.error('Erreur suppression leads:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, deletedCount: ids.length })
    
  } catch (error) {
    console.error('Erreur API admin leads DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

