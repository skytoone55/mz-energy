import { createClient } from '@/lib/supabase/server'
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

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Récupérer les simulations de l'utilisateur
  const { data: simulations, count } = await supabase
    .from('simulations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculer les stats
  const totalSimulations = count || 0
  const totalEconomies = simulations?.reduce((acc, sim) => {
    const resultats = sim.resultats as { scenarios: { economiesAnnuelles: number }[] }
    if (!resultats?.scenarios?.length) return acc
    const maxEconomies = Math.max(...resultats.scenarios.map(s => s.economiesAnnuelles))
    return acc + maxEconomies
  }, 0) || 0

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('prenom')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour {profile?.prenom} !
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace professionnel
          </p>
        </div>
        <Link href="/dashboard/simulation/nouvelle">
          <Button className="bg-solar-gradient hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle simulation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total simulations
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSimulations}</div>
            <p className="text-xs text-muted-foreground">
              simulations créées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Économies cumulées
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatShekel(totalEconomies)}</div>
            <p className="text-xs text-muted-foreground">
              potentiel annuel total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ce mois
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations?.filter(s => {
                const date = new Date(s.created_at)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              simulations ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Simulations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Simulations récentes</CardTitle>
            <CardDescription>
              Vos 5 dernières simulations
            </CardDescription>
          </div>
          <Link href="/dashboard/simulations">
            <Button variant="outline" size="sm" className="gap-2">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {simulations && simulations.length > 0 ? (
            <div className="space-y-4">
              {simulations.map((sim) => {
                const resultats = sim.resultats as { 
                  scenarios: { economiesAnnuelles: number; id: string }[],
                  meilleurScenario: string 
                }
                const meilleur = resultats.scenarios.find(s => s.id === resultats.meilleurScenario)
                
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
                        Scénario {resultats.meilleurScenario}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">Aucune simulation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre première simulation pour commencer
              </p>
              <Link href="/dashboard/simulation/nouvelle">
                <Button className="bg-solar-gradient hover:opacity-90 text-white">
                  Créer une simulation
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

