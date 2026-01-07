import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/pv-engine'
import type { ScenarioWithPrice } from '@/lib/price-engine'
import { ExportPDFButton } from '@/components/export-pdf-button'
import { SimulationDetailClient } from '@/components/simulation-detail-client'
import { EditableSimulationName } from '@/components/editable-simulation-name'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SimulationResultats {
  scenarios: ScenarioWithPrice[]
  meilleurScenario: string
  feasibility: {
    possible: boolean
    warnings: string[]
  }
}

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Vérifier le rôle pour autoriser les admins à voir toutes les simulations
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Si admin, ne pas filtrer par user_id
  let query = supabase
    .from('simulations')
    .select('*')
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data: simulation } = await query.single()

  if (!simulation) {
    notFound()
  }

  const resultats = simulation.resultats as SimulationResultats
  const scenarios = resultats.scenarios

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/simulations" className="pdf-hide">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <EditableSimulationName
              simulationId={simulation.id}
              currentName={simulation.nom_projet}
              canEdit={isAdmin || (!!profile && (profile.role === 'commercial' || simulation.user_id === user.id))}
            />
            <p className="text-muted-foreground">
              {new Date(simulation.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pdf-hide">
          <Link href={`/dashboard/simulation/${simulation.id}/modifier`}>
            <Button variant="outline">
              Modifier
            </Button>
          </Link>
          <ExportPDFButton simulation={simulation} showPrices={true} />
        </div>
      </div>

      {/* Contenu à exporter en PDF */}
      <div id="simulation-pdf-content">
      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Consommation</p>
              <p className="text-lg font-semibold">{formatNumber(simulation.conso_annuelle)} kWh/an</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Part jour</p>
              <p className="text-lg font-semibold">{simulation.part_jour}%</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Surface</p>
              <p className="text-lg font-semibold">{simulation.surface_toit} m²</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Prix achat</p>
              <p className="text-lg font-semibold">{simulation.prix_achat_kwh} ₪/kWh</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Prix revente</p>
              <p className="text-lg font-semibold">{simulation.prix_revente_kwh} ₪/kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scénarios avec onglets si nécessaire - Client Component pour gérer l'état */}
      <SimulationDetailClient 
        simulation={simulation}
        showPrices={true}
      />
      
      {/* Élément caché pour stocker les données filtrées pour le PDF */}
      <div className="hidden" id="pdf-export-data" />
      </div>
    </div>
  )
}

