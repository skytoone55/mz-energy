/**
 * MZ ENERGY - Moteur de calcul photovoltaïque
 * Implémente les règles de dimensionnement du cahier des charges
 */

// ============================================
// TYPES
// ============================================

export interface SimulationInput {
  consoAnnuelle: number      // kWh/an
  partJour: number           // Pourcentage (0-100)
  surfaceToit: number        // m²
  prixAchatKwh: number       // ₪/kWh
  prixReventeKwh: number     // ₪/kWh
}

export interface ScenarioResult {
  id: 'A' | 'B' | 'C' | 'D'
  nom: string
  description: string
  realisable: boolean
  statut: 'OK' | 'PARTIEL'
  
  // Dimensionnement
  surfaceNecessaire: number  // m²
  nombrePanneaux: number
  puissanceKwc: number       // kWc
  productionAnnuelle: number // kWh
  
  // Pour scénarios C et D
  capaciteBatterie?: number  // kWh
  
  // Économies (VISIBLE POUR TOUS)
  economiesAnnuelles: number     // ₪
  economies20Ans: number         // ₪
  revenusReventeAnnuels: number  // ₪ (pour scénarios B et D)
  
  // Équipement sélectionné (références uniquement, pas de prix)
  equipement: {
    panneau: string
    onduleur: string
    batterie?: string
  }
}

export interface SimulationResult {
  input: SimulationInput
  scenarios: ScenarioResult[]
  meilleurScenario: 'A' | 'B' | 'C' | 'D'
  calculeLe: string
}

// ============================================
// CONSTANTES PAR DÉFAUT
// ============================================

const CONFIG = {
  ensoleillement: 1800,        // h/an (Israël)
  performanceRatio: 0.88,      // Rendement global
  dodBatterie: 0.95,           // Profondeur de décharge
  rendementBatterie: 0.95,     // Efficacité batterie
  capRevente: 14000,           // kWh/an max revendable
  batterieMax: 1000,           // kWh max
  inflationElectricite: 0.015, // 1.5%/an
}

// Panneau par défaut
const PANNEAU = {
  reference: 'SOLAR PANEL GKA182N144S 600W',
  puissanceW: 600,
  surfaceM2: 3,
}

// Onduleurs On-Grid (pour scénarios A et B)
const ONDULEURS_ONGRID = [
  { reference: 'SUN-5K-G05P1-EU-AM2', pvMaxKwc: 7.5 },
  { reference: 'SUN-6K-G05P1-EU-AM2', pvMaxKwc: 7.8 },
  { reference: 'SUN-8K-G06P3-EU-BM2-P1', pvMaxKwc: 12 },
  { reference: 'SUN-12K-G06P3-EU-BM2-P1', pvMaxKwc: 18 },
  { reference: 'SUN-18K-G05', pvMaxKwc: 23.4 },
  { reference: 'SUN 25K-G05', pvMaxKwc: 32.5 },
  { reference: 'SUN 35K-G04', pvMaxKwc: 45.5 },
  { reference: 'SUN 50K-G04', pvMaxKwc: 65 },
  { reference: 'SUN-70K-G04P3-EU-AM4', pvMaxKwc: 105 },
  { reference: 'SUN-110K-G03', pvMaxKwc: 150 },
]

// Onduleurs Hybrides (pour scénarios C et D)
const ONDULEURS_HYBRIDES = [
  { reference: 'SUN-12K-SG04LP3-EU', pvMaxKwc: 15.6 },
  { reference: 'SUN 25K-SG01HP3-EU-AM2', pvMaxKwc: 32 },
  { reference: 'SUN 40K-SG01HP3-EU-BM4', pvMaxKwc: 52 },
  { reference: 'SUN 50K-SG01HP3-EU-BM4', pvMaxKwc: 65 },
  { reference: 'SUN 60K (combo)', pvMaxKwc: 80 },
  { reference: 'SUN 80K (combo)', pvMaxKwc: 104 },
  { reference: 'SUN 100K (combo)', pvMaxKwc: 130 },
]

// Batteries
const BATTERIES = [
  { reference: 'HVM60S100BL', capaciteKwh: 19.2 },
  { reference: 'HVM75S100BL', capaciteKwh: 24 },
  { reference: 'HVM90S100BL', capaciteKwh: 28.8 },
  { reference: 'HVM105S100BL', capaciteKwh: 33.6 },
  { reference: 'HVM120S100BL', capaciteKwh: 38.4 },
  { reference: 'HVM96S314BL-U', capaciteKwh: 96.5 },
  { reference: 'HVM144S314BL', capaciteKwh: 144.7 },
  { reference: 'HVM192S314BL', capaciteKwh: 193 },
  { reference: 'HVM240S314BL', capaciteKwh: 241.2 },
]

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Calcule le productible annuel (kWh/kWc/an)
 */
function getProductible(): number {
  return CONFIG.ensoleillement * CONFIG.performanceRatio
}

/**
 * Sélectionne l'onduleur le plus petit couvrant le besoin
 */
function selectOnduleur(puissanceKwc: number, hybride: boolean) {
  const liste = hybride ? ONDULEURS_HYBRIDES : ONDULEURS_ONGRID
  const onduleur = liste.find(o => o.pvMaxKwc >= puissanceKwc)
  return onduleur || liste[liste.length - 1]
}

/**
 * Sélectionne la batterie la plus petite couvrant le besoin
 */
function selectBatterie(capaciteNecessaire: number) {
  const batterie = BATTERIES.find(b => b.capaciteKwh >= capaciteNecessaire)
  return batterie || BATTERIES[BATTERIES.length - 1]
}

/**
 * Calcule les économies sur 20 ans avec inflation
 */
function calculerEconomies20Ans(economiesAn1: number): number {
  let total = 0
  let economie = economiesAn1
  for (let i = 0; i < 20; i++) {
    total += economie
    economie *= (1 + CONFIG.inflationElectricite)
  }
  return Math.round(total)
}

// ============================================
// CALCUL DES SCÉNARIOS
// ============================================

/**
 * Scénario A : Couvre uniquement la consommation de jour
 */
function calculerScenarioA(input: SimulationInput): ScenarioResult {
  const productible = getProductible()
  const consoJour = input.consoAnnuelle * (input.partJour / 100)
  
  // Puissance nécessaire
  const puissanceKwc = consoJour / productible
  const nombrePanneaux = Math.ceil((puissanceKwc * 1000) / PANNEAU.puissanceW)
  const puissanceReelle = (nombrePanneaux * PANNEAU.puissanceW) / 1000
  const surfaceNecessaire = nombrePanneaux * PANNEAU.surfaceM2
  
  // Production
  const productionAnnuelle = puissanceReelle * productible
  
  // Économies = consommation jour évitée
  const economiesAnnuelles = Math.min(productionAnnuelle, consoJour) * input.prixAchatKwh
  
  // Équipement
  const onduleur = selectOnduleur(puissanceReelle, false)
  
  // Faisabilité
  const realisable = surfaceNecessaire <= input.surfaceToit
  
  return {
    id: 'A',
    nom: 'Autoconsommation Jour',
    description: 'Couvre uniquement la consommation de jour',
    realisable,
    statut: realisable ? 'OK' : 'PARTIEL',
    surfaceNecessaire: Math.round(surfaceNecessaire),
    nombrePanneaux,
    puissanceKwc: Math.round(puissanceReelle * 10) / 10,
    productionAnnuelle: Math.round(productionAnnuelle),
    economiesAnnuelles: Math.round(economiesAnnuelles),
    economies20Ans: calculerEconomies20Ans(economiesAnnuelles),
    revenusReventeAnnuels: 0,
    equipement: {
      panneau: PANNEAU.reference,
      onduleur: onduleur.reference,
    }
  }
}

/**
 * Scénario B : Couvre le jour + vend le surplus au réseau
 */
function calculerScenarioB(input: SimulationInput): ScenarioResult {
  const productible = getProductible()
  const consoJour = input.consoAnnuelle * (input.partJour / 100)
  
  // Production cible = conso jour + cap revente
  const productionCible = consoJour + CONFIG.capRevente
  
  // Puissance nécessaire
  const puissanceKwc = productionCible / productible
  const nombrePanneaux = Math.ceil((puissanceKwc * 1000) / PANNEAU.puissanceW)
  const puissanceReelle = (nombrePanneaux * PANNEAU.puissanceW) / 1000
  const surfaceNecessaire = nombrePanneaux * PANNEAU.surfaceM2
  
  // Production
  const productionAnnuelle = puissanceReelle * productible
  
  // Économies = conso jour évitée + revente surplus (plafonné)
  const consoJourEvitee = Math.min(productionAnnuelle, consoJour)
  const surplus = Math.min(productionAnnuelle - consoJourEvitee, CONFIG.capRevente)
  const economiesAnnuelles = consoJourEvitee * input.prixAchatKwh
  const revenusRevente = surplus * input.prixReventeKwh
  
  // Équipement
  const onduleur = selectOnduleur(puissanceReelle, false)
  
  // Faisabilité
  const realisable = surfaceNecessaire <= input.surfaceToit
  
  return {
    id: 'B',
    nom: 'Jour + Revente',
    description: 'Couvre le jour + vend le surplus au réseau',
    realisable,
    statut: realisable ? 'OK' : 'PARTIEL',
    surfaceNecessaire: Math.round(surfaceNecessaire),
    nombrePanneaux,
    puissanceKwc: Math.round(puissanceReelle * 10) / 10,
    productionAnnuelle: Math.round(productionAnnuelle),
    economiesAnnuelles: Math.round(economiesAnnuelles + revenusRevente),
    economies20Ans: calculerEconomies20Ans(economiesAnnuelles + revenusRevente),
    revenusReventeAnnuels: Math.round(revenusRevente),
    equipement: {
      panneau: PANNEAU.reference,
      onduleur: onduleur.reference,
    }
  }
}

/**
 * Scénario C : Couvre jour + nuit (autonomie maximale avec batterie)
 */
function calculerScenarioC(input: SimulationInput): ScenarioResult {
  const productible = getProductible()
  const consoJour = input.consoAnnuelle * (input.partJour / 100)
  const consoNuit = input.consoAnnuelle * ((100 - input.partJour) / 100)
  
  // Production cible = conso jour + conso nuit / rendement batterie
  const productionCible = consoJour + (consoNuit / CONFIG.rendementBatterie)
  
  // Puissance nécessaire
  const puissanceKwc = productionCible / productible
  const nombrePanneaux = Math.ceil((puissanceKwc * 1000) / PANNEAU.puissanceW)
  const puissanceReelle = (nombrePanneaux * PANNEAU.puissanceW) / 1000
  const surfaceNecessaire = nombrePanneaux * PANNEAU.surfaceM2
  
  // Production
  const productionAnnuelle = puissanceReelle * productible
  
  // Capacité batterie nécessaire (conso nuit journalière moyenne)
  const consoNuitJournaliere = consoNuit / 365
  const capaciteBatterieNecessaire = consoNuitJournaliere / (CONFIG.dodBatterie * CONFIG.rendementBatterie)
  const batterie = selectBatterie(capaciteBatterieNecessaire)
  
  // Économies = toute la conso évitée
  const economiesAnnuelles = input.consoAnnuelle * input.prixAchatKwh
  
  // Équipement
  const onduleur = selectOnduleur(puissanceReelle, true)
  
  // Faisabilité
  const realisable = surfaceNecessaire <= input.surfaceToit
  
  return {
    id: 'C',
    nom: 'Autonomie Totale',
    description: 'Couvre jour + nuit (autonomie maximale)',
    realisable,
    statut: realisable ? 'OK' : 'PARTIEL',
    surfaceNecessaire: Math.round(surfaceNecessaire),
    nombrePanneaux,
    puissanceKwc: Math.round(puissanceReelle * 10) / 10,
    productionAnnuelle: Math.round(productionAnnuelle),
    capaciteBatterie: Math.round(batterie.capaciteKwh * 10) / 10,
    economiesAnnuelles: Math.round(economiesAnnuelles),
    economies20Ans: calculerEconomies20Ans(economiesAnnuelles),
    revenusReventeAnnuels: 0,
    equipement: {
      panneau: PANNEAU.reference,
      onduleur: onduleur.reference,
      batterie: batterie.reference,
    }
  }
}

/**
 * Scénario D : Couvre tout + vend le surplus restant
 */
function calculerScenarioD(input: SimulationInput): ScenarioResult {
  const productible = getProductible()
  const consoJour = input.consoAnnuelle * (input.partJour / 100)
  const consoNuit = input.consoAnnuelle * ((100 - input.partJour) / 100)
  
  // Production cible = conso jour + conso nuit / rendement + cap revente
  const productionCible = consoJour + (consoNuit / CONFIG.rendementBatterie) + CONFIG.capRevente
  
  // Puissance nécessaire
  const puissanceKwc = productionCible / productible
  const nombrePanneaux = Math.ceil((puissanceKwc * 1000) / PANNEAU.puissanceW)
  const puissanceReelle = (nombrePanneaux * PANNEAU.puissanceW) / 1000
  const surfaceNecessaire = nombrePanneaux * PANNEAU.surfaceM2
  
  // Production
  const productionAnnuelle = puissanceReelle * productible
  
  // Capacité batterie nécessaire
  const consoNuitJournaliere = consoNuit / 365
  const capaciteBatterieNecessaire = consoNuitJournaliere / (CONFIG.dodBatterie * CONFIG.rendementBatterie)
  const batterie = selectBatterie(capaciteBatterieNecessaire)
  
  // Économies = toute la conso évitée + revente surplus
  const economiesAnnuelles = input.consoAnnuelle * input.prixAchatKwh
  const revenusRevente = CONFIG.capRevente * input.prixReventeKwh
  
  // Équipement
  const onduleur = selectOnduleur(puissanceReelle, true)
  
  // Faisabilité
  const realisable = surfaceNecessaire <= input.surfaceToit
  
  return {
    id: 'D',
    nom: 'Autonomie + Revente',
    description: 'Couvre tout + vend le surplus restant',
    realisable,
    statut: realisable ? 'OK' : 'PARTIEL',
    surfaceNecessaire: Math.round(surfaceNecessaire),
    nombrePanneaux,
    puissanceKwc: Math.round(puissanceReelle * 10) / 10,
    productionAnnuelle: Math.round(productionAnnuelle),
    capaciteBatterie: Math.round(batterie.capaciteKwh * 10) / 10,
    economiesAnnuelles: Math.round(economiesAnnuelles + revenusRevente),
    economies20Ans: calculerEconomies20Ans(economiesAnnuelles + revenusRevente),
    revenusReventeAnnuels: Math.round(revenusRevente),
    equipement: {
      panneau: PANNEAU.reference,
      onduleur: onduleur.reference,
      batterie: batterie.reference,
    }
  }
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Calcule tous les scénarios pour une simulation
 * ATTENTION : Cette fonction ne retourne PAS les prix (réservés aux commerciaux)
 */
export function calculerSimulation(input: SimulationInput): SimulationResult {
  const scenarios: ScenarioResult[] = [
    calculerScenarioA(input),
    calculerScenarioB(input),
    calculerScenarioC(input),
    calculerScenarioD(input),
  ]
  
  // Trouver le meilleur scénario (max économies réalisable)
  const scenariosRealisables = scenarios.filter(s => s.realisable)
  const meilleur = scenariosRealisables.length > 0
    ? scenariosRealisables.reduce((a, b) => a.economiesAnnuelles > b.economiesAnnuelles ? a : b)
    : scenarios[0]
  
  return {
    input,
    scenarios,
    meilleurScenario: meilleur.id,
    calculeLe: new Date().toISOString(),
  }
}

/**
 * Formatte un nombre en devise israélienne
 */
export function formatShekel(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatte un nombre avec séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num)
}

