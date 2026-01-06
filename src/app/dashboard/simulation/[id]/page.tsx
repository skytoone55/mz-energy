import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Sun, 
  Zap, 
  Battery, 
  TrendingUp,
  Check,
  Star,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatShekel, formatNumber } from '@/lib/pv-engine'
import type { ScenarioWithPrice } from '@/lib/price-engine'
import { ExportPDFButton } from '@/components/export-pdf-button'

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

  const scenarioLabels: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
    A: { 
      name: 'Autoconsommation Pure', 
      description: 'Production dimensionnée sur la consommation journalière',
      icon: Sun
    },
    B: { 
      name: 'On-Grid avec Revente', 
      description: 'Production maximale avec revente du surplus',
      icon: Zap
    },
    C: { 
      name: 'Hybride Autonomie', 
      description: 'Batteries pour couvrir la nuit',
      icon: Battery
    },
    D: { 
      name: 'Hybride Premium', 
      description: 'Installation maximale avec stockage',
      icon: Star
    },
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/simulations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {simulation.nom_projet || `Simulation #${simulation.id.slice(0, 8)}`}
            </h1>
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
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/simulation/${simulation.id}/modifier`}>
            <Button variant="outline">
              Modifier
            </Button>
          </Link>
          <ExportPDFButton simulation={simulation} showPrices={true} />
        </div>
      </div>

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

      {/* Scénarios */}
      <div className="grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario) => {
          const info = scenarioLabels[scenario.id]
          const isMeilleur = scenario.id === resultats.meilleurScenario
          const Icon = info.icon

          return (
            <Card 
              key={scenario.id}
              className={isMeilleur ? 'ring-2 ring-energy' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      scenario.id === 'C' || scenario.id === 'D' 
                        ? 'bg-energy/10' 
                        : 'bg-solar/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        scenario.id === 'C' || scenario.id === 'D' 
                          ? 'text-energy' 
                          : 'text-solar'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Scénario {scenario.id}: {info.name}
                      </CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  {isMeilleur && (
                    <Badge className="bg-energy text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Recommandé
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Équipements */}
                <div>
                  <h4 className="font-medium mb-3">Équipements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Panneaux</span>
                      <span>{scenario.nombrePanneaux} × 600W ({scenario.puissanceKwc.toFixed(1)} kWc)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surface</span>
                      <span>{scenario.surfaceNecessaire} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Onduleur</span>
                      <span className="text-right">{scenario.equipement.onduleur}</span>
                    </div>
                    {scenario.equipement.batterie && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batterie</span>
                        <span>{scenario.equipement.batterie}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Production & Économies */}
                <div>
                  <h4 className="font-medium mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Production annuelle</span>
                      <span>{formatNumber(scenario.productionAnnuelle)} kWh</span>
                    </div>
                    {scenario.revenusReventeAnnuels > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenus revente</span>
                        <span>{formatShekel(scenario.revenusReventeAnnuels)}/an</span>
                      </div>
                    )}
                    <div className="flex justify-between text-energy font-semibold pt-2 border-t">
                      <span>Économies annuelles</span>
                      <span>{formatShekel(scenario.economiesAnnuelles)}</span>
                    </div>
                  </div>
                </div>

                {/* PRIX - Affichés uniquement aux commerciaux */}
                <div className="p-4 rounded-xl bg-solar/5 border border-solar/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-solar" />
                    Tarification (TTC)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Matériel</span>
                      <span>{formatShekel(scenario.prixMateriel)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Installation</span>
                      <span>{formatShekel(scenario.prixInstallation)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Prix HT</span>
                      <span>{formatShekel(scenario.prixHT)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Prix TTC</span>
                      <span className="text-solar">{formatShekel(scenario.prixTTC)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Amortissement
                      </span>
                      <Badge variant="secondary">
                        {scenario.amortissementAnnees} ans
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

