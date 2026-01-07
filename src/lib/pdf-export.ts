'use client'

import jsPDF from 'jspdf'
import { formatShekel, formatNumber } from './pv-engine'
import type { ScenarioWithPrice } from './price-engine'

interface SimulationData {
  nomProjet?: string
  id: string
  created_at: string
  conso_annuelle: number
  part_jour: number
  surface_toit: number
  prix_achat_kwh: number
  prix_revente_kwh: number
  resultats: {
    scenarios: ScenarioWithPrice[]
    meilleurScenario: string
  }
}

interface UserProfile {
  prenom: string
  nom: string
  email: string
}

// Couleurs Premium (Light Mode Stripe-like)
const COLORS = {
  background: [255, 255, 255],        // #FFFFFF
  cardBg: [248, 250, 252],            // #F8FAFC
  textPrimary: [15, 23, 42],          // #0F172A
  textSecondary: [100, 116, 139],     // #64748B
  accent: [245, 158, 11],             // #F59E0B (MZ Energy orange)
  success: [34, 197, 94],             // #22C55E (Recommandé)
  border: [226, 232, 240],            // #E2E8F0
  progressBg: [226, 232, 240],        // #E2E8F0
  successLight: [220, 252, 231],      // #DCFCE7
}

// Couleurs scénarios V4
const SCENARIO_COLORS: Record<string, [number, number, number]> = {
  A: [254, 243, 199],  // #FEF3C7 - Jaune
  B: [255, 237, 213],  // #FFEDD5 - Orange
  C: [219, 234, 254],  // #DBEAFE - Bleu
  D: [209, 250, 229],  // #D1FAE5 - Vert clair
  'D-2': [167, 243, 208], // #A7F3D0 - Vert foncé
}

// Icônes pour chaque scénario (émojis Unicode)
const SCENARIO_ICONS: Record<string, string> = {
  A: '☀',  // Soleil
  B: '⚡',  // Éclair
  C: '🔋',  // Batterie
  D: '⭐',  // Étoile
  'D-2': '💰', // Argent
}

const SCENARIO_LABELS: Record<string, { name: string; description: string }> = {
  A: { name: 'Autoconsommation Jour', description: 'Couvre uniquement la consommation de jour' },
  B: { name: 'Jour + Revente', description: 'Couvre le jour + vend le surplus au réseau' },
  C: { name: 'Autonomie Totale', description: 'Couvre jour + nuit (autonomie maximale)' },
  D: { name: 'Autonomie + Revente', description: 'Couvre tout + vend le surplus restant' },
  'D-2': { name: 'Revente Prioritaire', description: 'Revente prioritaire quand PARTIEL' },
}

export function exportSimulationPDF(
  simulation: SimulationData,
  user?: UserProfile | null,
  showPrices: boolean = true
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  let yPos = margin
  
  // ============================================
  // HEADER PREMIUM
  // ============================================
  // Fond orange MZ Energy (top bar)
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.rect(0, 0, pageWidth, 35, 'F')
  
  // Logo et titre
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('MZ ENERGY', margin, 22)
  
  // Date élégante
  const dateStr = new Date(simulation.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(dateStr.toUpperCase(), pageWidth - margin, 22, { align: 'right' })
  
  // Ligne de séparation subtile
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(margin, 42, pageWidth - margin, 42)
  
  yPos = 50
  
  // ============================================
  // SECTION PROJET (Card Premium)
  // ============================================
  const projectTitle = simulation.nomProjet || `Simulation #${simulation.id.slice(0, 8)}`
  
  // Card background gris très clair
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2])
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 38, 4, 4, 'F')
  
  // Bordure légère
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 38, 4, 4, 'S')
  
  // Titre SIMULATION PHOTOVOLTAÏQUE (lettres espacées)
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2])
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SIMULATION PHOTOVOLTAÏQUE', margin + 12, yPos + 12)
  
  // Nom du projet
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
  doc.text(`Projet: ${projectTitle}`, margin + 12, yPos + 20)
  
  // Commercial
  if (user) {
    doc.text(`Commercial: ${user.prenom} ${user.nom}`, margin + 12, yPos + 28)
  }
  
  yPos += 50
  
  // ============================================
  // PARAMÈTRES (5 Mini-Cards)
  // ============================================
  const paramWidth = (pageWidth - 2 * margin - 16) / 5
  const paramHeight = 28
  
  const params = [
    { label: 'Conso', value: `${formatNumber(simulation.conso_annuelle)}`, unit: 'kWh/an' },
    { label: 'Jour', value: `${simulation.part_jour}`, unit: '%' },
    { label: 'Surface', value: `${simulation.surface_toit}`, unit: 'm²' },
    { label: 'Achat', value: `${simulation.prix_achat_kwh}`, unit: '₪/kWh' },
    { label: 'Vente', value: `${simulation.prix_revente_kwh}`, unit: '₪/kWh' },
  ]
  
  params.forEach((param, idx) => {
    const x = margin + idx * (paramWidth + 4)
    
    // Card blanche avec bordure
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, yPos, paramWidth, paramHeight, 3, 3, 'F')
    
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    doc.setLineWidth(0.5)
    doc.roundedRect(x, yPos, paramWidth, paramHeight, 3, 3, 'S')
    
    // Valeur en gros
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(param.value, x + paramWidth / 2, yPos + 10, { align: 'center' })
    
    // Label
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
    doc.text(param.label, x + paramWidth / 2, yPos + 15, { align: 'center' })
    
    // Unité
    doc.text(param.unit, x + paramWidth / 2, yPos + 21, { align: 'center' })
  })
  
  yPos += paramHeight + 20
  
  // ============================================
  // SCÉNARIOS (Cards Premium avec Icônes)
  // ============================================
  // Récupérer la surface requise pour le scénario C
  const scenarioC = simulation.resultats.scenarios.find(s => s.id === 'C')
  const scenarioD = simulation.resultats.scenarios.find(s => s.id === 'D')
  const surfaceRequiseC = scenarioC?.surfaceNecessaire || Infinity
  const surfaceToit = simulation.surface_toit
  
  // Logique d'affichage : 2 scénarios selon la surface
  // Si surface < surface requise pour C : Afficher A et B uniquement
  // Sinon : Afficher C et (D si D est OK, sinon D-2 si visible)
  const scenarios = simulation.resultats.scenarios.filter(s => {
    if (surfaceToit < surfaceRequiseC) {
      return s.id === 'A' || s.id === 'B'
    } else {
      if (s.id === 'C') return true
      // Si D est OK, afficher D (pas D-2 qui serait identique)
      if (scenarioD?.statut === 'OK' && s.id === 'D') return true
      // Sinon, afficher D-2 s'il est visible (différent de D)
      if (scenarioD?.statut !== 'OK' && s.id === 'D-2' && s.showInResults !== false) return true
      return false
    }
  })
  
  const meilleurId = simulation.resultats.meilleurScenario
  
  // Calculer le max des économies pour les barres de progression
  const maxEconomies = scenarios.length > 0 
    ? Math.max(...scenarios.map(s => s.economiesAnnuelles))
    : 0
  
  const cardWidth = (pageWidth - 2 * margin - 10) / 2
  const cardHeight = 95
  let cardStartY = yPos
  let currentCol = 0
  
  scenarios.forEach((scenario, index) => {
    const x = margin + currentCol * (cardWidth + 10)
    
    // Nouvelle page si nécessaire
    if (currentCol === 0 && cardStartY + cardHeight > pageHeight - 40) {
      doc.addPage()
      cardStartY = margin + 10
    }
    
    const currentY = cardStartY
    
    const color = SCENARIO_COLORS[scenario.id] || [200, 200, 200]
    const label = SCENARIO_LABELS[scenario.id] || { name: scenario.nom, description: scenario.description }
    const icon = SCENARIO_ICONS[scenario.id] || '●'
    const isMeilleur = scenario.id === meilleurId
    
    // Card background blanc
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 5, 5, 'F')
    
    // Bordure gauche colorée (épaisse)
    doc.setFillColor(...color)
    doc.roundedRect(x, currentY, 5, cardHeight, 0, 5, 'F')
    
    // Bordure card
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    doc.setLineWidth(0.5)
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 5, 5, 'S')
    
    // Bordure verte si recommandé
    if (isMeilleur) {
      doc.setDrawColor(COLORS.success[0], COLORS.success[1], COLORS.success[2])
      doc.setLineWidth(2)
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 5, 5, 'S')
    }
    
    let textY = currentY + 12
    
    // Header avec icône et titre
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2])
    doc.text(`${icon} SCÉNARIO ${scenario.id}`, x + 12, textY)
    
    // Badge RECOMMANDÉ
    if (isMeilleur) {
      const badgeWidth = 25
      const badgeX = x + cardWidth - badgeWidth - 8
      doc.setFillColor(COLORS.successLight[0], COLORS.successLight[1], COLORS.successLight[2])
      doc.roundedRect(badgeX, currentY + 6, badgeWidth, 8, 2, 2, 'F')
      doc.setDrawColor(COLORS.success[0], COLORS.success[1], COLORS.success[2])
      doc.setLineWidth(0.5)
      doc.roundedRect(badgeX, currentY + 6, badgeWidth, 8, 2, 2, 'S')
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2])
      doc.text('RECOMMANDÉ', badgeX + badgeWidth / 2, currentY + 10.5, { align: 'center' })
    }
    
    textY += 8
    
    // Nom du scénario
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
    doc.text(label.name, x + 12, textY, { maxWidth: cardWidth - 24 })
    textY += 7
    
    // Ligne de séparation
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    doc.setLineWidth(0.5)
    doc.line(x + 12, textY, x + cardWidth - 12, textY)
    textY += 8
    
    // Équipements (compact)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2])
    
    const equipText = `${scenario.nombrePanneaux} panneaux  •  ${scenario.puissanceKwc.toFixed(1)} kWc  •  ${scenario.surfaceNecessaire} m²`
    doc.text(equipText, x + 12, textY, { maxWidth: cardWidth - 24 })
    textY += 6
    
    if (scenario.equipement.batterie) {
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
      doc.text(`Batterie: ${scenario.equipement.batterie}`, x + 12, textY, { maxWidth: cardWidth - 24 })
      textY += 8
    } else {
      textY += 6
    }
    
    // Barre de progression pour les économies
    const progressWidth = cardWidth - 24
    const progressHeight = 5
    const progressX = x + 12
    const progressValue = scenario.economiesAnnuelles / maxEconomies
    
    // Fond de la barre
    doc.setFillColor(COLORS.progressBg[0], COLORS.progressBg[1], COLORS.progressBg[2])
    doc.roundedRect(progressX, textY, progressWidth, progressHeight, 2, 2, 'F')
    
    // Remplissage proportionnel
    const fillWidth = progressWidth * progressValue
    if (fillWidth > 0) {
      doc.setFillColor(color[0], color[1], color[2])
      doc.roundedRect(progressX, textY, fillWidth, progressHeight, 2, 2, 'F')
    }
    
    textY += 9
    
    // Valeur des économies
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2])
    doc.text(`Économies: ${formatShekel(scenario.economiesAnnuelles)}/an`, x + 12, textY, { maxWidth: cardWidth - 24 })
    textY += 6
    
    // Revente si applicable
    if (scenario.revenusReventeAnnuels > 0) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
      doc.text(`Revente: ${formatShekel(scenario.revenusReventeAnnuels)}/an`, x + 12, textY, { maxWidth: cardWidth - 24 })
      textY += 7
    } else {
      textY += 5
    }
    
    // Ligne de séparation
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    doc.line(x + 12, textY, x + cardWidth - 12, textY)
    textY += 7
    
    // Prix TTC (si commercial)
    if (showPrices && scenario.prixTTC) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
      doc.text(`Prix TTC: ${formatShekel(scenario.prixTTC)}`, x + 12, textY, { maxWidth: cardWidth - 24 })
      textY += 6
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
      doc.text(`Amortissement: ${scenario.amortissementAnnees} ans`, x + 12, textY, { maxWidth: cardWidth - 24 })
    }
    
    // Passer à la colonne suivante ou à la ligne suivante
    currentCol++
    if (currentCol >= 2) {
      currentCol = 0
      cardStartY += cardHeight + 12
    }
  })

  // ============================================
  // FOOTER MODERNE (sur toutes les pages)
  // ============================================
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Ligne subtile
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    
    // Texte footer
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2])
    doc.text(
      `MZ Energy - Simulation Photovoltaïque V4 - Page ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )
  }

  // Télécharger
  const fileName = `MZ-Energy_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}
