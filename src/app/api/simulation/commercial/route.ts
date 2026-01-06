import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculerSimulation } from '@/lib/pv-engine'
import { calculerPrixSimulation, DEFAULT_PRICE_CONFIG } from '@/lib/price-engine'
import { simulationSchema } from '@/lib/validations'

/**
 * API Route pour créer une simulation commerciale (avec prix)
 * POST /api/simulation/commercial
 * 
 * SÉCURITÉ : Cette route nécessite une authentification
 * et retourne les prix TTC uniquement aux commerciaux/admins
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Récupérer le profil pour la marge commerciale
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
    
    // Calculer la simulation de base
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
    
    // Sauvegarder la simulation
    const { data: simulation, error: simError } = await supabase
      .from('simulations')
      .insert({
        user_id: user.id,
        nom_projet: body.nomProjet || null,
        conso_annuelle: data.consoAnnuelle,
        part_jour: data.partJour,
        surface_toit: data.surfaceToit,
        prix_achat_kwh: data.prixAchatKwh,
        prix_revente_kwh: data.prixReventeKwh,
        resultats: resultatsComplets,
        type: 'commercial',
      })
      .select()
      .single()
    
    if (simError) {
      console.error('Erreur création simulation:', simError)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      simulationId: simulation.id,
      resultats: resultatsComplets,
    })
    
  } catch (error) {
    console.error('Erreur API simulation commerciale:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

