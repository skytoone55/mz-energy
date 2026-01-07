import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { calculerSimulation } from '@/lib/pv-engine'
import { calculerPrixSimulation, DEFAULT_PRICE_CONFIG } from '@/lib/price-engine'
import { simulationSchema } from '@/lib/validations'

/**
 * API Route pour mettre à jour une simulation commerciale
 * PUT /api/simulation/commercial/[id]
 */
export async function PUT(
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
      .select('id, user_id')
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
    
    // Validation des données
    const validationResult = simulationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Calculer la nouvelle simulation
    const resultats = calculerSimulation({
      consoAnnuelle: data.consoAnnuelle,
      partJour: data.partJour,
      surfaceToit: data.surfaceToit,
      prixAchatKwh: data.prixAchatKwh,
      prixReventeKwh: data.prixReventeKwh,
    })
    
    // Calculer les prix (marge fixe MZ Energy 28%)
    const priceConfig = {
      ...DEFAULT_PRICE_CONFIG,
    }
    
    const scenariosAvecPrix = calculerPrixSimulation(resultats.scenarios, priceConfig)
    
    // Construire les résultats complets
    const resultatsComplets = {
      ...resultats,
      scenarios: scenariosAvecPrix,
    }
    
    // Données à mettre à jour
    const updateData = {
      nom_projet: body.nomProjet || null,
      conso_annuelle: data.consoAnnuelle,
      part_jour: data.partJour,
      surface_toit: data.surfaceToit,
      prix_achat_kwh: data.prixAchatKwh,
      prix_revente_kwh: data.prixReventeKwh,
      resultats: resultatsComplets,
    }
    
    // Utiliser le client admin pour contourner les RLS lors de la mise à jour
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY manquante')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Mettre à jour la simulation avec le client admin
    const { error: updateError } = await adminSupabase
      .from('simulations')
      .update(updateData)
      .eq('id', id)
    
    if (updateError) {
      console.error('Erreur mise à jour simulation:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }
    
    // Récupérer la simulation mise à jour pour vérifier que tout est bien sauvegardé
    const { data: updatedSimulation, error: fetchUpdatedError } = await adminSupabase
      .from('simulations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchUpdatedError) {
      console.error('Erreur récupération simulation mise à jour:', fetchUpdatedError)
      // Retourner quand même les données calculées même si la récupération échoue
      return NextResponse.json({
        success: true,
        simulationId: id,
        resultats: resultatsComplets,
      })
    }
    
    // Retourner toutes les données de la simulation mise à jour
    return NextResponse.json({
      success: true,
      simulationId: id,
      simulation: {
        id: updatedSimulation.id,
        nom_projet: updatedSimulation.nom_projet,
        conso_annuelle: updatedSimulation.conso_annuelle,
        part_jour: updatedSimulation.part_jour,
        surface_toit: updatedSimulation.surface_toit,
        prix_achat_kwh: updatedSimulation.prix_achat_kwh,
        prix_revente_kwh: updatedSimulation.prix_revente_kwh,
        resultats: updatedSimulation.resultats,
      },
      resultats: resultatsComplets,
    })
    
  } catch (error) {
    console.error('Erreur API simulation commerciale PUT:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

