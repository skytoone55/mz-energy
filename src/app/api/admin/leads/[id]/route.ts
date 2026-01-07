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
 * API Route pour récupérer un lead spécifique
 * GET /api/admin/leads/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const { id } = await params
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    const { data: lead, error: fetchError } = await adminSupabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
      }
      console.error('Erreur récupération lead:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }
    
    return NextResponse.json({ lead })
    
  } catch (error) {
    console.error('Erreur API admin leads GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour modifier un lead
 * PATCH /api/admin/leads/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { prenom, nom, email, telephone, ville, notes } = body
    
    // Validation
    if (!prenom || !nom || !email) {
      return NextResponse.json({ error: 'Prénom, nom et email sont requis' }, { status: 400 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Préparer les données à mettre à jour
    const updateData: any = {
      prenom,
      nom,
      email,
      updated_at: new Date().toISOString(),
    }
    
    if (telephone !== undefined) updateData.telephone = telephone || null
    if (ville !== undefined) updateData.ville = ville || null
    if (notes !== undefined) updateData.notes = notes || null
    
    const { data: lead, error: updateError } = await adminSupabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Erreur mise à jour lead:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, lead })
    
  } catch (error) {
    console.error('Erreur API admin leads PATCH:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour supprimer un lead
 * DELETE /api/admin/leads/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }
    
    const { id } = await params
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Vérifier s'il existe une simulation associée
    const { data: simulation } = await adminSupabase
      .from('simulations')
      .select('id')
      .eq('lead_id', id)
      .maybeSingle()
    
    // Supprimer la simulation si elle existe (cascade supprimera aussi les références)
    if (simulation) {
      const { error: simDeleteError } = await adminSupabase
        .from('simulations')
        .delete()
        .eq('id', simulation.id)
      
      if (simDeleteError) {
        console.error('Erreur suppression simulation:', simDeleteError)
        return NextResponse.json({ error: 'Erreur lors de la suppression de la simulation associée' }, { status: 500 })
      }
    }
    
    // Supprimer le lead
    const { error: deleteError } = await adminSupabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Erreur suppression lead:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erreur API admin leads DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

