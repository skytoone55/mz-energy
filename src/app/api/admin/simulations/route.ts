import { NextResponse } from 'next/server'
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
 * API Route pour récupérer toutes les simulations (admin only)
 * GET /api/admin/simulations
 */
export async function GET() {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 })
    }
    
    // Utiliser service role pour contourner RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    const { data: simulations, error: fetchError } = await adminSupabase
      .from('simulations')
      .select(`
        *,
        user_profiles:user_id(prenom, nom),
        leads:lead_id(prenom, nom)
      `)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Erreur récupération simulations:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }
    
    return NextResponse.json({ simulations: simulations || [] })
    
  } catch (error) {
    console.error('Erreur API admin simulations GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

