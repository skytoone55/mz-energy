/**
 * Types pour MZ ENERGY
 */

// ============================================
// BASE DE DONNÉES
// ============================================

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  ville?: string
  contacted: boolean
  contacted_at?: string
  notes?: string
}

export interface Simulation {
  id: string
  created_at: string
  updated_at: string
  lead_id?: string
  user_id?: string
  nom_projet?: string
  conso_annuelle: number
  part_jour: number
  surface_toit: number
  prix_achat_kwh: number
  prix_revente_kwh: number
  resultats: SimulationResultats
  type: 'particulier' | 'commercial'
}

export interface SimulationResultats {
  input: {
    consoAnnuelle: number
    partJour: number
    surfaceToit: number
    prixAchatKwh: number
    prixReventeKwh: number
  }
  scenarios: ScenarioResultat[]
  meilleurScenario: 'A' | 'B' | 'C' | 'D' | 'D-2'
  calculeLe: string
}

export interface ScenarioResultat {
  id: 'A' | 'B' | 'C' | 'D' | 'D-2'
  nom: string
  description: string
  realisable: boolean
  statut: 'OK' | 'PARTIEL'
  showInResults?: boolean
  surfaceNecessaire: number
  nombrePanneaux: number
  puissanceKwc: number
  productionAnnuelle: number
  capaciteBatterie?: number
  economiesAnnuelles: number
  economies20Ans: number
  revenusReventeAnnuels: number
  equipement: {
    panneau: string
    onduleur: string
    batterie?: string
  }
}

export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  role: 'commercial' | 'admin'
  actif: boolean
}

export interface SystemConfig {
  id: string
  key: string
  value: number
  description?: string
  updated_at: string
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  category: 'panneau' | 'onduleur_ongrid' | 'onduleur_hybride' | 'batterie'
  reference: string
  puissance_w?: number
  surface_m2?: number
  pv_max_kwc?: number
  capacite_kwh?: number
  prix_revient: number  // CONFIDENTIEL
  actif: boolean
}

// ============================================
// FORMULAIRES
// ============================================

export interface LeadFormData {
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
}

export interface SimulationFormData {
  consoAnnuelle: number
  partJour: number
  surfaceToit: number
  prixAchatKwh: number
  prixReventeKwh: number
}

export interface FullSimulationFormData extends LeadFormData, SimulationFormData {}

