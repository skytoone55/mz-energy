import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Helper pour vérifier l'accès et récupérer le profil
 */
async function getUserProfile() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { authorized: false, error: 'Non authentifié', statusCode: 401, user: null, profile: null }
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    return { authorized: false, error: 'Profil non trouvé', statusCode: 403, user, profile: null }
  }
  
  return { authorized: true, user, profile, error: null, statusCode: 200 }
}

/**
 * API Route pour récupérer les simulations avec filtres
 * GET /api/dashboard/simulations?commercialId=xxx&search=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { authorized, error, statusCode, user, profile } = await getUserProfile()
    
    if (!authorized || !user || !profile) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const commercialId = searchParams.get('commercialId')
    const search = searchParams.get('search')?.trim()
    const statut = searchParams.get('statut') // 'en_cours' ou 'validee'
    const isAdmin = profile.role === 'admin'
    
    let supabaseClient
    
    if (isAdmin) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
      }
      supabaseClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    } else {
      supabaseClient = await createClient()
    }
    
    // Construire la requête avec jointures explicites
    let query = supabaseClient
      .from('simulations')
      .select(`
        *,
        user_profiles(prenom, nom, email),
        leads(prenom, nom, email, telephone),
        contacts(prenom, nom, email, telephone)
      `)
      .order('created_at', { ascending: false })
    
    // Pour les commerciaux (non-admin), filtrer uniquement leurs simulations
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    } else if (commercialId) {
      // Filtre admin par commercial
      if (commercialId === 'unassigned') {
        query = query.is('user_id', null)
      } else {
        query = query.eq('user_id', commercialId)
      }
    }
    
    // Filtrer par statut si fourni
    if (statut) {
      query = query.eq('statut', statut)
    } else {
      // Par défaut, "Mes simulations" affiche uniquement les "en_cours"
      // Mais on laisse vide pour que l'appelant décide
    }
    
    const { data: simulations, error: fetchError } = await query
    
    if (fetchError) {
      console.error('Erreur récupération simulations:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }
    
    // Filtrage recherche textuelle
    let filteredSimulations = simulations || []
    
    if (search) {
      const s = search.toLowerCase()
      filteredSimulations = filteredSimulations.filter((sim: any) => {
        const projet = sim.nom_projet?.toLowerCase() || ''
        const comm = sim.user_profiles ? `${sim.user_profiles.prenom} ${sim.user_profiles.nom}`.toLowerCase() : ''
        const lead = sim.leads ? `${sim.leads.prenom} ${sim.leads.nom}`.toLowerCase() : ''
        const email = (sim.user_profiles?.email || sim.leads?.email || '').toLowerCase()
        const tel = sim.leads?.telephone || ''
        
        return projet.includes(s) || comm.includes(s) || lead.includes(s) || email.includes(s) || tel.includes(s)
      })
    }
    
    return NextResponse.json({ 
      simulations: filteredSimulations,
      count: filteredSimulations.length,
      isAdmin: isAdmin
    })
    
  } catch (error) {
    console.error('Erreur API dashboard simulations GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour supprimer des simulations (unitaire ou en masse)
 * DELETE /api/dashboard/simulations?id=xxx (unitaire)
 * DELETE /api/dashboard/simulations (en masse avec body: { ids: [...] })
 */
export async function DELETE(request: NextRequest) {
  try {
    const { authorized, error, statusCode, user, profile } = await getUserProfile()
    
    if (!authorized || !user || !profile) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const isAdmin = profile.role === 'admin'
    
    // Récupérer les IDs à supprimer
    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('id')
    
    let idsToDelete: string[] = []
    
    if (singleId) {
      // Suppression unitaire
      idsToDelete = [singleId]
    } else {
      // Suppression en masse via body
      const body = await request.json().catch(() => ({}))
      if (body.ids && Array.isArray(body.ids)) {
        idsToDelete = body.ids
      } else {
        return NextResponse.json({ error: 'IDs manquants' }, { status: 400 })
      }
    }
    
    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'Aucun ID fourni' }, { status: 400 })
    }
    
    // Utiliser service role pour admins, client normal pour commerciaux
    let supabaseClient
    
    if (isAdmin) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
      }
      supabaseClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    } else {
      supabaseClient = await createClient()
      
      // Pour les commerciaux, vérifier qu'ils sont propriétaires de toutes les simulations
      const { data: simulations, error: checkError } = await supabaseClient
        .from('simulations')
        .select('id, user_id')
        .in('id', idsToDelete)
      
      if (checkError) {
        return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
      }
      
      // Vérifier que toutes les simulations appartiennent à l'utilisateur
      const unauthorized = simulations?.some((sim: any) => sim.user_id !== user.id)
      if (unauthorized) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    }
    
    // Supprimer les simulations
    const { error: deleteError } = await supabaseClient
      .from('simulations')
      .delete()
      .in('id', idsToDelete)
    
    if (deleteError) {
      console.error('Erreur suppression simulations:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      deleted: idsToDelete.length
    })
    
  } catch (error) {
    console.error('Erreur API dashboard simulations DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
