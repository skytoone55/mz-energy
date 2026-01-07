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

// Couleurs V4
const SCENARIO_COLORS: Record<string, [number, number, number]> = {
  A: [254, 243, 199],  // #FEF3C7 - Jaune
  B: [255, 237, 213],  // #FFEDD5 - Orange
  C: [219, 234, 254],  // #DBEAFE - Bleu
  D: [209, 250, 229],  // #D1FAE5 - Vert clair
  'D-2': [167, 243, 208], // #A7F3D0 - Vert foncé
}

const SCENARIO_LABELS: Record<string, { name: string; description: string }> = {
  A: { name: 'Autoconsommation Jour', description: 'Couvre uniquement la consommation de jour' },
  B: { name: 'Jour + Revente', description: 'Couvre le jour + vend le surplus au réseau' },
  C: { name: 'Autonomie Totale', description: 'Couvre jour + nuit (autonomie maximale)' },
  D: { name: 'Autonomie + Revente', description: 'Couvre tout + vend le surplus restant' },
  'D-2': { name: 'Revente Prioritaire', description: 'Revente prioritaire quand PARTIEL' },
}

// Fonction pour convertir hex en RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

export function exportSimulationPDF(
  simulation: SimulationData,
  user?: UserProfile | null,
  showPrices: boolean = true
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15
  const cardPadding = 8
  
  // Header avec dégradé
  const headerHeight = 50
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('MZ ENERGY', margin, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Simulation Photovoltaïque', pageWidth - margin, 30, { align: 'right' })
  
  // Project Info (style Card)
  let yPos = headerHeight + 15
  
  const projectTitle = simulation.nomProjet || `Simulation #${simulation.id.slice(0, 8)}`
  
  // Card background pour les paramètres
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, 'F')
  
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, 'S')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(projectTitle, margin + cardPadding, yPos + 12)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateStr = new Date(simulation.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Généré le ${dateStr}`, margin + cardPadding, yPos + 20)
  
  if (user) {
    doc.text(`Par ${user.prenom} ${user.nom}`, margin + cardPadding, yPos + 27)
  }
  
  yPos += 55

  // Paramètres (style Dashboard)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Paramètres de simulation', margin, yPos)
  yPos += 10
  
  // Grille de paramètres (5 colonnes)
  const paramWidth = (pageWidth - 2 * margin - 20) / 5
  const params = [
    { label: 'Consommation', value: `${formatNumber(simulation.conso_annuelle)} kWh/an` },
    { label: 'Part jour', value: `${simulation.part_jour}%` },
    { label: 'Surface', value: `${simulation.surface_toit} m²` },
    { label: 'Prix achat', value: `${simulation.prix_achat_kwh} ₪/kWh` },
    { label: 'Prix revente', value: `${simulation.prix_revente_kwh} ₪/kWh` },
  ]
  
  params.forEach((param, idx) => {
    const x = margin + idx * (paramWidth + 5)
    
    doc.setFillColor(240, 245, 249)
    doc.roundedRect(x, yPos, paramWidth, 20, 2, 2, 'F')
    
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(param.label, x + 3, yPos + 6)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(param.value, x + 3, yPos + 14, { maxWidth: paramWidth - 6 })
  })
  
  yPos += 35

  // Scénarios (Cards colorées style Web)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Résultats par scénario', margin, yPos)
  yPos += 12
  
  const scenarios = simulation.resultats.scenarios
    .filter(s => s.showInResults !== false) // Masquer D-2 si identique à D
  const meilleurId = simulation.resultats.meilleurScenario
  
  const cardWidth = (pageWidth - 2 * margin - 10) / 2
  const cardHeight = 85
  
  scenarios.forEach((scenario, index) => {
    // Nouvelle page si nécessaire
    if (yPos + cardHeight > pageHeight - 30) {
      doc.addPage()
      yPos = margin + 10
    }
    
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = margin + col * (cardWidth + 10)
    const currentY = yPos + row * (cardHeight + 10)
    
    const color = SCENARIO_COLORS[scenario.id] || [200, 200, 200]
    const label = SCENARIO_LABELS[scenario.id] || { name: scenario.nom, description: scenario.description }
    const isMeilleur = scenario.id === meilleurId
    
    // Card background avec couleur V4
    doc.setFillColor(color[0], color[1], color[2])
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, 'F')
    
    // Bordure si recommandé
    if (isMeilleur) {
      doc.setDrawColor(34, 197, 94)
      doc.setLineWidth(2)
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, 'S')
    }
    
    // Bordure gauche colorée
    doc.setFillColor(color[0] - 20, color[1] - 20, color[2] - 20)
    doc.rect(x, currentY, 4, cardHeight, 'F')
    
    let textY = currentY + 8
    
    // Titre
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Scénario ${scenario.id}: ${label.name}`, x + 8, textY, { maxWidth: cardWidth - 16 })
    
    if (isMeilleur) {
      doc.setFillColor(34, 197, 94)
      doc.circle(x + cardWidth - 12, currentY + 10, 4, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text('★', x + cardWidth - 12, currentY + 12.5, { align: 'center' })
    }
    
    textY += 5
    
    // Description
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text(label.description, x + 8, textY, { maxWidth: cardWidth - 16 })
    textY += 8
    
    // Équipements
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Panneaux: ${scenario.nombrePanneaux} × 600W`, x + 8, textY, { maxWidth: cardWidth - 16 })
    textY += 5
    doc.text(`Puissance: ${scenario.puissanceKwc.toFixed(1)} kWc`, x + 8, textY, { maxWidth: cardWidth - 16 })
    textY += 5
    doc.text(`Surface: ${scenario.surfaceNecessaire} m²`, x + 8, textY, { maxWidth: cardWidth - 16 })
    textY += 5
    
    if (scenario.equipement.batterie) {
      doc.text(`Batterie: ${scenario.equipement.batterie}`, x + 8, textY, { maxWidth: cardWidth - 16 })
      textY += 5
    }
    
    // Performance
    textY += 3
    doc.setDrawColor(200, 200, 200)
    doc.line(x + 8, textY, x + cardWidth - 8, textY)
    textY += 5
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`Économies: ${formatShekel(scenario.economiesAnnuelles)}/an`, x + 8, textY, { maxWidth: cardWidth - 16 })
    textY += 5
    
    if (scenario.revenusReventeAnnuels > 0) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`Revente: ${formatShekel(scenario.revenusReventeAnnuels)}/an`, x + 8, textY, { maxWidth: cardWidth - 16 })
      textY += 5
    }
    
    // Prix (si commercial)
    if (showPrices && scenario.prixTTC) {
      textY += 2
      doc.setDrawColor(200, 200, 200)
      doc.line(x + 8, textY, x + cardWidth - 8, textY)
      textY += 5
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(245, 158, 11)
      doc.text(`Prix TTC: ${formatShekel(scenario.prixTTC)}`, x + 8, textY, { maxWidth: cardWidth - 16 })
      textY += 5
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`Amortissement: ${scenario.amortissementAnnees} ans`, x + 8, textY, { maxWidth: cardWidth - 16 })
    }
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `MZ Energy - Simulation Photovoltaïque V4 - Page ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Download
  const fileName = `MZ-Energy_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}

