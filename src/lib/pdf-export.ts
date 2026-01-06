'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

export function exportSimulationPDF(
  simulation: SimulationData,
  user?: UserProfile | null,
  showPrices: boolean = true
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // Header
  doc.setFillColor(245, 158, 11) // Solar orange
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('MZ ENERGY', 20, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Simulation Photovoltaïque', pageWidth - 20, 25, { align: 'right' })
  
  // Project Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const projectTitle = simulation.nomProjet || `Simulation #${simulation.id.slice(0, 8)}`
  doc.text(projectTitle, 20, 55)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateStr = new Date(simulation.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.text(`Généré le ${dateStr}`, 20, 62)
  
  if (user) {
    doc.text(`Par ${user.prenom} ${user.nom}`, 20, 68)
  }

  // Parameters Table
  let yPos = 80
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Paramètres de simulation', 20, yPos)
  
  yPos += 5
  
  autoTable(doc, {
    startY: yPos,
    head: [['Paramètre', 'Valeur']],
    body: [
      ['Consommation annuelle', `${formatNumber(simulation.conso_annuelle)} kWh/an`],
      ['Part consommation jour', `${simulation.part_jour}%`],
      ['Surface de toiture', `${simulation.surface_toit} m²`],
      ['Prix achat kWh', `${simulation.prix_achat_kwh} ₪`],
      ['Prix revente kWh', `${simulation.prix_revente_kwh} ₪`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] },
    margin: { left: 20, right: 20 },
  })

  // Scenarios
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos + 50
  yPos = finalY + 15
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Résultats par scénario', 20, yPos)
  
  const scenarios = simulation.resultats.scenarios
  const meilleurId = simulation.resultats.meilleurScenario

  const scenarioLabels: Record<string, string> = {
    A: 'Autoconsommation Pure',
    B: 'On-Grid avec Revente',
    C: 'Hybride Autonomie',
    D: 'Hybride Premium',
  }

  scenarios.forEach((scenario, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    yPos += 10
    
    const isMeilleur = scenario.id === meilleurId
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(isMeilleur ? 34 : 0, isMeilleur ? 197 : 0, isMeilleur ? 94 : 0)
    doc.text(
      `Scénario ${scenario.id}: ${scenarioLabels[scenario.id]}${isMeilleur ? ' ★ RECOMMANDÉ' : ''}`,
      20,
      yPos
    )
    
    yPos += 3
    
    const bodyData: (string | number)[][] = [
      ['Panneaux', `${scenario.nombrePanneaux} × 600W (${scenario.puissanceKwc.toFixed(1)} kWc)`],
      ['Surface utilisée', `${scenario.surfaceUtilisee} m²`],
      ['Onduleur', scenario.equipement.onduleur],
      ['Production annuelle', `${formatNumber(scenario.productionAnnuelle)} kWh`],
      ['Autoconsommation', `${formatNumber(scenario.autoconsommation)} kWh`],
      ['Économies annuelles', formatShekel(scenario.economiesAnnuelles)],
    ]
    
    if (scenario.equipement.batterie) {
      bodyData.splice(3, 0, ['Batterie', scenario.equipement.batterie])
    }
    
    if (scenario.reventeKwh > 0) {
      bodyData.splice(-1, 0, ['Revente réseau', `${formatNumber(scenario.reventeKwh)} kWh`])
    }
    
    // Add prices if commercial
    if (showPrices && scenario.prixTTC) {
      bodyData.push(['Prix TTC', formatShekel(scenario.prixTTC)])
      bodyData.push(['Amortissement', `${scenario.amortissementAnnees} ans`])
    }
    
    autoTable(doc, {
      startY: yPos,
      body: bodyData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 100 },
      },
      margin: { left: 20, right: 20 },
    })
    
    yPos = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos + 40
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `MZ Energy - Simulation Photovoltaïque - Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Download
  const fileName = `MZ-Energy_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}

