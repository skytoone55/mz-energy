import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculerSimulation } from '@/lib/pv-engine'
import { fullSimulationSchema } from '@/lib/validations'

/**
 * API Route pour créer une simulation (particuliers)
 * POST /api/simulation
 * 
 * SÉCURITÉ : Cette route ne retourne JAMAIS de prix.
 * Les économies sont calculées mais pas les coûts d'installation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validationResult = fullSimulationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    const supabase = await createClient()
    
    // 1. Créer le lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone || null,
        ville: data.ville || null,
      })
      .select()
      .single()
    
    if (leadError) {
      console.error('Erreur création lead:', leadError)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      )
    }
    
    // 2. Calculer la simulation
    const resultats = calculerSimulation({
      consoAnnuelle: data.consoAnnuelle,
      partJour: data.partJour,
      surfaceToit: data.surfaceToit,
      prixAchatKwh: data.prixAchatKwh,
      prixReventeKwh: data.prixReventeKwh,
    })
    
    // 3. Générer le nom automatique : {nom} {prenom} - Simulation #{numero}
    // Compter les simulations existantes pour ce lead
    const { count } = await supabase
      .from('simulations')
      .select('*', { count: 'exact', head: true })
      .eq('lead_id', lead.id)
    
    const numeroSimulation = (count || 0) + 1
    const nomProjet = `${data.nom} ${data.prenom} - Simulation #${numeroSimulation}`
    
    // 4. Sauvegarder la simulation
    const { data: simulation, error: simError } = await supabase
      .from('simulations')
      .insert({
        lead_id: lead.id,
        nom_projet: nomProjet,
        conso_annuelle: data.consoAnnuelle,
        part_jour: data.partJour,
        surface_toit: data.surfaceToit,
        prix_achat_kwh: data.prixAchatKwh,
        prix_revente_kwh: data.prixReventeKwh,
        resultats: resultats,
        type: 'particulier',
        statut: 'en_cours',
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
    
    // 4. Retourner les résultats (SANS prix)
    return NextResponse.json({
      success: true,
      simulationId: simulation.id,
      resultats: resultats,
    })
    
  } catch (error) {
    console.error('Erreur API simulation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

