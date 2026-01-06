/**
 * MZ ENERGY - Moteur de calcul des prix
 * CONFIDENTIEL - Exécution côté serveur uniquement
 * Ne JAMAIS exposer ces fonctions au client
 */

import type { ScenarioResult } from './pv-engine'

// ============================================
// TYPES
// ============================================

export interface PriceConfig {
  margeGlobale: number      // Ex: 0.25 (25%)
  margeCommercial: number   // Ex: 0.05 (5%)
  tva: number               // Ex: 0.18 (18%)
  coutInstallation: number  // ₪/kWc
  fraisFixes: number        // ₪
}

export interface ScenarioWithPrice extends ScenarioResult {
  // Prix (CONFIDENTIEL - uniquement pour commerciaux connectés)
  prixMateriel: number      // ₪
  prixInstallation: number  // ₪
  prixRevient: number       // ₪ (materiel + installation)
  prixHT: number            // ₪ (avec marges)
  prixTTC: number           // ₪ (avec TVA)
  amortissementAnnees: number
}

// ============================================
// CATALOGUES AVEC PRIX
// ============================================

const PANNEAU = {
  reference: 'SOLAR PANEL GKA182N144S 600W',
  puissanceW: 600,
  surfaceM2: 3,
  prixRevient: 240.38,
}

const ONDULEURS_ONGRID = [
  { reference: 'SUN-5K-G05P1-EU-AM2', pvMaxKwc: 7.5, prixRevient: 1414 },
  { reference: 'SUN-6K-G05P1-EU-AM2', pvMaxKwc: 7.8, prixRevient: 1532 },
  { reference: 'SUN-8K-G06P3-EU-BM2-P1', pvMaxKwc: 12, prixRevient: 1744 },
  { reference: 'SUN-12K-G06P3-EU-BM2-P1', pvMaxKwc: 18, prixRevient: 1885 },
  { reference: 'SUN-18K-G05', pvMaxKwc: 23.4, prixRevient: 2639 },
  { reference: 'SUN 25K-G05', pvMaxKwc: 32.5, prixRevient: 3017 },
  { reference: 'SUN 35K-G04', pvMaxKwc: 45.5, prixRevient: 4148 },
  { reference: 'SUN 50K-G04', pvMaxKwc: 65, prixRevient: 5420 },
  { reference: 'SUN-70K-G04P3-EU-AM4', pvMaxKwc: 105, prixRevient: 6834 },
  { reference: 'SUN-110K-G03', pvMaxKwc: 150, prixRevient: 9380 },
]

const ONDULEURS_HYBRIDES = [
  { reference: 'SUN-12K-SG04LP3-EU', pvMaxKwc: 15.6, prixRevient: 7494 },
  { reference: 'SUN 25K-SG01HP3-EU-AM2', pvMaxKwc: 32, prixRevient: 8437 },
  { reference: 'SUN 40K-SG01HP3-EU-BM4', pvMaxKwc: 52, prixRevient: 16921 },
  { reference: 'SUN 50K-SG01HP3-EU-BM4', pvMaxKwc: 65, prixRevient: 18806 },
  { reference: 'SUN 60K (combo)', pvMaxKwc: 80, prixRevient: 25300 },
  { reference: 'SUN 80K (combo)', pvMaxKwc: 104, prixRevient: 33842 },
  { reference: 'SUN 100K (combo)', pvMaxKwc: 130, prixRevient: 37612 },
]

const BATTERIES = [
  { reference: 'HVM60S100BL', capaciteKwh: 19.2, prixRevient: 11873 },
  { reference: 'HVM75S100BL', capaciteKwh: 24, prixRevient: 14559 },
  { reference: 'HVM90S100BL', capaciteKwh: 28.8, prixRevient: 16928 },
  { reference: 'HVM105S100BL', capaciteKwh: 33.6, prixRevient: 19287 },
  { reference: 'HVM120S100BL', capaciteKwh: 38.4, prixRevient: 21646 },
  { reference: 'HVM96S314BL-U', capaciteKwh: 96.5, prixRevient: 38142 },
  { reference: 'HVM144S314BL', capaciteKwh: 144.7, prixRevient: 55011 },
  { reference: 'HVM192S314BL', capaciteKwh: 193, prixRevient: 72545 },
  { reference: 'HVM240S314BL', capaciteKwh: 241.2, prixRevient: 88776 },
]

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function getOnduleurPrice(reference: string, hybride: boolean): number {
  const liste = hybride ? ONDULEURS_HYBRIDES : ONDULEURS_ONGRID
  const onduleur = liste.find(o => o.reference === reference)
  return onduleur?.prixRevient || 0
}

function getBatteriePrice(reference: string | undefined): number {
  if (!reference) return 0
  const batterie = BATTERIES.find(b => b.reference === reference)
  return batterie?.prixRevient || 0
}

/**
 * Calcule les prix pour un scénario
 * ATTENTION : Cette fonction ne doit être appelée que côté serveur
 * pour les utilisateurs authentifiés (commerciaux/admins)
 */
export function calculerPrixScenario(
  scenario: ScenarioResult,
  config: PriceConfig
): ScenarioWithPrice {
  const isHybride = scenario.id === 'C' || scenario.id === 'D'
  
  // Prix matériel
  const prixPanneaux = scenario.nombrePanneaux * PANNEAU.prixRevient
  const prixOnduleur = getOnduleurPrice(scenario.equipement.onduleur, isHybride)
  const prixBatterie = getBatteriePrice(scenario.equipement.batterie)
  const prixMateriel = prixPanneaux + prixOnduleur + prixBatterie
  
  // Prix installation
  const prixInstallation = (scenario.puissanceKwc * config.coutInstallation) + config.fraisFixes
  
  // Prix de revient total
  const prixRevient = prixMateriel + prixInstallation
  
  // Prix HT avec marges
  const prixHT = prixRevient * (1 + config.margeGlobale) * (1 + config.margeCommercial)
  
  // Prix TTC
  const prixTTC = prixHT * (1 + config.tva)
  
  // Amortissement
  const amortissementAnnees = scenario.economiesAnnuelles > 0 
    ? Math.ceil(prixTTC / scenario.economiesAnnuelles * 10) / 10
    : 0
  
  return {
    ...scenario,
    prixMateriel: Math.round(prixMateriel),
    prixInstallation: Math.round(prixInstallation),
    prixRevient: Math.round(prixRevient),
    prixHT: Math.round(prixHT),
    prixTTC: Math.round(prixTTC),
    amortissementAnnees,
  }
}

/**
 * Calcule les prix pour tous les scénarios
 */
export function calculerPrixSimulation(
  scenarios: ScenarioResult[],
  config: PriceConfig
): ScenarioWithPrice[] {
  return scenarios.map(scenario => calculerPrixScenario(scenario, config))
}

/**
 * Configuration par défaut
 */
export const DEFAULT_PRICE_CONFIG: PriceConfig = {
  margeGlobale: 0.25,
  margeCommercial: 0.05,
  tva: 0.18,
  coutInstallation: 980,
  fraisFixes: 11850,
}

