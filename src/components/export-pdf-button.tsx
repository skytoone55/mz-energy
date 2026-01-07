'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface ExportPDFButtonProps {
  simulation: {
    id: string
    nom_projet?: string
    created_at: string
    conso_annuelle: number
    part_jour: number
    surface_toit: number
    prix_achat_kwh: number
    prix_revente_kwh: number
    resultats: unknown
  }
  showPrices?: boolean
  onActiveScenariosChange?: (ids: string[]) => void
}

export function ExportPDFButton({ simulation, showPrices = false, onActiveScenariosChange }: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [user, setUser] = useState<{ prenom: string; nom: string; email: string } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('prenom, nom, email')
          .eq('id', authUser.id)
          .single()
        if (profile) setUser(profile)
      }
    }
    loadUser()
  }, [supabase])

  const handleExport = async () => {
    setExporting(true)
    try {
      // Import dynamique pour réduire la taille du bundle
      const { exportSimulationPDF } = await import('@/lib/pdf-export')
      
      // Vérifier s'il y a un élément avec les données filtrées (depuis SimulationDetailClient)
      let simulationToExport = simulation
      const pdfDataElement = document.getElementById('pdf-export-data')
      if (pdfDataElement && pdfDataElement.textContent) {
        try {
          simulationToExport = JSON.parse(pdfDataElement.textContent)
        } catch (e) {
          console.warn('Impossible de parser les données PDF filtrées, utilisation des données par défaut')
        }
      }
      
      // Convertir les données de simulation au bon format
      const simulationData = {
        id: simulationToExport.id,
        nomProjet: simulationToExport.nom_projet,
        created_at: simulationToExport.created_at,
        conso_annuelle: simulationToExport.conso_annuelle,
        part_jour: simulationToExport.part_jour,
        surface_toit: simulationToExport.surface_toit,
        prix_achat_kwh: simulationToExport.prix_achat_kwh,
        prix_revente_kwh: simulationToExport.prix_revente_kwh,
        resultats: simulationToExport.resultats as {
          scenarios: any[]
          meilleurScenario: string
        }
      }
      
      exportSimulationPDF(simulationData, user, showPrices)
    } catch (error) {
      console.error('Erreur export PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button 
      onClick={handleExport}
      disabled={exporting}
      className="bg-solar-gradient hover:opacity-90 text-white gap-2"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Export...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  )
}

