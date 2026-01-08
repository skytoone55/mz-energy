'use client'

import Link from 'next/link'
import { 
  Calculator, 
  FolderOpen, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatShekel, formatNumber } from '@/lib/pv-engine'
import { T } from '@/components/T'

interface Simulation {
  id: string
  nom_projet: string | null
  created_at: string
  conso_annuelle: number
  surface_toit: number
  resultats: {
    scenarios: { economiesAnnuelles: number; id: string }[]
    meilleurScenario: string
  }
}

interface DashboardContentProps {
  prenom: string
  simulations: Simulation[]
  totalSimulations: number
  totalEconomies: number
  simulationsThisMonth: number
}

export function DashboardContent({ 
  prenom, 
  simulations, 
  totalSimulations, 
  totalEconomies,
  simulationsThisMonth 
}: DashboardContentProps) {
  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <T>Bonjour</T> {prenom} !
          </h1>
          <p className="text-muted-foreground mt-1">
            <T>Bienvenue dans votre espace professionnel</T>
          </p>
        </div>
        <Link href="/dashboard/simulation/nouvelle">
          <Button className="bg-solar-gradient hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" />
            <T>Nouvelle simulation</T>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <T>Total simulations</T>
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSimulations}</div>
            <p className="text-xs text-muted-foreground">
              <T>simulations créées</T>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <T>Économies cumulées</T>
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatShekel(totalEconomies)}</div>
            <p className="text-xs text-muted-foreground">
              <T>potentiel annuel total</T>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <T>Ce mois</T>
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulationsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              <T>simulations ce mois-ci</T>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Simulations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle><T>Simulations récentes</T></CardTitle>
            <CardDescription>
              <T>Vos 5 dernières simulations</T>
            </CardDescription>
          </div>
          <Link href="/dashboard/simulations">
            <Button variant="outline" size="sm" className="gap-2">
              <T>Voir tout</T>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {simulations && simulations.length > 0 ? (
            <div className="space-y-4">
              {simulations.map((sim) => {
                const meilleur = sim.resultats.scenarios.find(s => s.id === sim.resultats.meilleurScenario)
                
                return (
                  <Link 
                    key={sim.id} 
                    href={`/dashboard/simulation/${sim.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-solar-gradient flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {sim.nom_projet || `Simulation du ${new Date(sim.created_at).toLocaleDateString('fr-FR')}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(sim.conso_annuelle)} kWh/an • {sim.surface_toit} m²
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-energy">
                        {formatShekel(meilleur?.economiesAnnuelles || 0)}/an
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        <T>Scénario</T> {sim.resultats.meilleurScenario}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2"><T>Aucune simulation</T></h3>
              <p className="text-sm text-muted-foreground mb-4">
                <T>Créez votre première simulation pour commencer</T>
              </p>
              <Link href="/dashboard/simulation/nouvelle">
                <Button className="bg-solar-gradient hover:opacity-90 text-white">
                  <T>Créer une simulation</T>
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

