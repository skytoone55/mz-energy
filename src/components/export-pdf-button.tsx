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
}

export function ExportPDFButton({ simulation, showPrices = false }: ExportPDFButtonProps) {
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
      // Dynamic import to keep client bundle smaller
      const { exportSimulationPDF } = await import('@/lib/pdf-export')
      exportSimulationPDF(
        simulation as Parameters<typeof exportSimulationPDF>[0],
        user,
        showPrices
      )
    } catch (error) {
      console.error('Erreur export PDF:', error)
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

