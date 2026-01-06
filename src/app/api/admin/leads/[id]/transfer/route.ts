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
 * API Route pour transférer un lead à un commercial
 * POST /api/admin/leads/[id]/transfer
 * Body: { commercialId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const { id: leadId } = await params
    const body = await request.json()
    const { commercialId } = body
    
    if (!commercialId) {
      return NextResponse.json({ error: 'ID commercial manquant' }, { status: 400 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Vérifier que le lead existe
    const { data: lead, error: leadError } = await adminSupabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single()
    
    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }
    
    // Vérifier que le commercial existe et est actif
    const { data: commercial, error: commercialError } = await adminSupabase
      .from('user_profiles')
      .select('id, role, actif')
      .eq('id', commercialId)
      .single()
    
    if (commercialError || !commercial) {
      return NextResponse.json({ error: 'Commercial non trouvé' }, { status: 404 })
    }
    
    if (commercial.role !== 'commercial') {
      return NextResponse.json({ error: 'L\'utilisateur n\'est pas un commercial' }, { status: 400 })
    }
    
    if (!commercial.actif) {
      return NextResponse.json({ error: 'Le commercial n\'est pas actif' }, { status: 400 })
    }
    
    // Trouver la simulation associée au lead
    const { data: simulation, error: simError } = await adminSupabase
      .from('simulations')
      .select('id')
      .eq('lead_id', leadId)
      .maybeSingle()
    
    if (simError) {
      console.error('Erreur recherche simulation:', simError)
      return NextResponse.json({ error: 'Erreur lors de la recherche de simulation' }, { status: 500 })
    }
    
    // Si une simulation existe, lui attribuer le commercial
    if (simulation) {
      const { error: updateError } = await adminSupabase
        .from('simulations')
        .update({ user_id: commercialId })
        .eq('id', simulation.id)
      
      if (updateError) {
        console.error('Erreur mise à jour simulation:', updateError)
        return NextResponse.json({ error: 'Erreur lors du transfert' }, { status: 500 })
      }
    } else {
      // Si aucune simulation n'existe, on peut créer une simulation vide ou juste marquer le lead
      // Pour l'instant, on retourne une erreur car il faut une simulation pour attribuer un commercial
      return NextResponse.json({ 
        error: 'Aucune simulation associée à ce lead' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true,
      simulationId: simulation.id,
      commercialId
    })
    
  } catch (error) {
    console.error('Erreur API transfer lead:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

