'use client'

import { useState, useEffect } from 'react'
import { ScenariosTabs } from './scenarios-tabs'
import type { ScenarioWithPrice } from '@/lib/price-engine'

interface SimulationDetailClientProps {
  simulation: {
    id: string
    nom_projet?: string
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
  showPrices?: boolean
}

export function SimulationDetailClient({ simulation, showPrices = false }: SimulationDetailClientProps) {
  const [activeScenarioIds, setActiveScenarioIds] = useState<string[]>([])

  // Créer une copie filtrée de la simulation pour le PDF
  const filteredSimulation = activeScenarioIds.length > 0
    ? {
        ...simulation,
        resultats: {
          ...simulation.resultats,
          scenarios: simulation.resultats.scenarios.filter(s => 
            activeScenarioIds.includes(s.id)
          ),
        },
      }
    : simulation

  // Mettre à jour l'élément caché avec les données filtrées
  useEffect(() => {
    const pdfDataElement = document.getElementById('pdf-export-data')
    if (pdfDataElement) {
      pdfDataElement.textContent = JSON.stringify(filteredSimulation)
    }
  }, [filteredSimulation, activeScenarioIds])

  return (
    <ScenariosTabs
      scenarios={simulation.resultats.scenarios}
      meilleurScenario={simulation.resultats.meilleurScenario}
      surfaceToit={simulation.surface_toit}
      onActiveTabChange={setActiveScenarioIds}
    />
  )
}

