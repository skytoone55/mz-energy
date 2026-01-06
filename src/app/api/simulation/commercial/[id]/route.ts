import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
      .select('role, marge_commercial')
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
    
    // Calculer les prix (avec la marge du commercial)
    const priceConfig = {
      ...DEFAULT_PRICE_CONFIG,
      margeCommercial: profile.marge_commercial || 0.05,
    }
    
    const scenariosAvecPrix = calculerPrixSimulation(resultats.scenarios, priceConfig)
    
    // Construire les résultats complets
    const resultatsComplets = {
      ...resultats,
      scenarios: scenariosAvecPrix,
    }
    
    // Mettre à jour la simulation
    const { data: simulation, error: updateError } = await supabase
      .from('simulations')
      .update({
        nom_projet: body.nomProjet || null,
        conso_annuelle: data.consoAnnuelle,
        part_jour: data.partJour,
        surface_toit: data.surfaceToit,
        prix_achat_kwh: data.prixAchatKwh,
        prix_revente_kwh: data.prixReventeKwh,
        resultats: resultatsComplets,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Erreur mise à jour simulation:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      simulationId: simulation.id,
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

