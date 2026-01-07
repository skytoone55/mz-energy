'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Sun, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  Zap, 
  Battery, 
  TrendingUp,
  Phone,
  Mail,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatShekel, formatNumber, type SimulationResult } from '@/lib/pv-engine'
import type { LeadFormValues } from '@/lib/validations'

interface ApiResponse {
  success: boolean
  simulationId: string
  resultats: SimulationResult
}

export default function ResultatPage() {
  const router = useRouter()
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [leadData, setLeadData] = useState<LeadFormValues | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResult = sessionStorage.getItem('simulationResult')
    const storedLead = sessionStorage.getItem('leadData')
    
    if (!storedResult) {
      router.push('/simulation')
      return
    }
    
    setResult(JSON.parse(storedResult))
    if (storedLead) {
      setLeadData(JSON.parse(storedLead))
    }
    setLoading(false)
  }, [router])

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Sun className="w-12 h-12 mx-auto mb-4 text-solar animate-spin" />
          <p className="text-muted-foreground">Chargement de vos résultats...</p>
        </div>
      </div>
    )
  }

  const { resultats } = result
  const meilleurScenario = resultats.scenarios.find(s => s.id === resultats.meilleurScenario)!
  
  // Récupérer la surface requise pour le scénario C
  const scenarioC = resultats.scenarios.find(s => s.id === 'C')
  const scenarioD = resultats.scenarios.find(s => s.id === 'D')
  const surfaceRequiseC = scenarioC?.surfaceNecessaire || Infinity
  
  // Logique d'affichage : 2 scénarios selon la surface
  // Si surface < surface requise pour C : Afficher A et B uniquement
  // Sinon : Afficher C et (D si D est OK, sinon D-2 si D-2 est visible)
  const surfaceToit = resultats.input.surfaceToit
  const scenariosAffiches = surfaceToit < surfaceRequiseC
    ? resultats.scenarios.filter(s => s.id === 'A' || s.id === 'B')
    : resultats.scenarios.filter(s => {
        if (s.id === 'C') return true
        // Si D est OK, afficher D (pas D-2 qui serait identique)
        if (scenarioD?.statut === 'OK' && s.id === 'D') return true
        // Sinon, afficher D-2 s'il est visible (différent de D)
        if (scenarioD?.statut !== 'OK' && s.id === 'D-2' && s.showInResults !== false) return true
        return false
      })
  
  // Scénarios réalisables (pour les summary cards)
  const scenariosOK = scenariosAffiches.filter(s => s.statut === 'OK')
  const scenariosPartiels = scenariosAffiches.filter(s => s.statut === 'PARTIEL')

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-solar-gradient flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MZ Energy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link 
            href="/simulation"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 no-print"
          >
            <ArrowLeft className="w-4 h-4" />
            Nouvelle simulation
          </Link>

          {/* Hero Result Card */}
          <Card className="shadow-2xl mb-8 overflow-hidden">
            <div className="bg-solar-gradient p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">
                      Résultat de votre simulation
                    </span>
                  </div>
                  {leadData && (
                    <h1 className="text-2xl font-bold mb-1">
                      Bonjour {leadData.prenom} !
                    </h1>
                  )}
                  <p className="opacity-90">
                    Voici vos économies potentielles avec le solaire
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Scénario recommandé : {meilleurScenario.id}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Économies annuelles</p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatShekel(meilleurScenario.economiesAnnuelles)}
                  </p>
                  <p className="text-sm text-energy font-medium mt-1">
                    Meilleur scénario réalisable
                  </p>
                </div>
                
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Économies sur 20 ans</p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatShekel(meilleurScenario.economies20Ans)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Avec inflation 1.5%/an
                  </p>
                </div>
                
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Production annuelle</p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatNumber(meilleurScenario.productionAnnuelle)} <span className="text-lg">kWh</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {meilleurScenario.nombrePanneaux} panneaux • {meilleurScenario.puissanceKwc} kWc
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios Comparison */}
          <h2 className="text-2xl font-bold mb-6">Comparaison des scénarios recommandés</h2>
          
          <Tabs defaultValue={scenariosAffiches.find(s => s.id === resultats.meilleurScenario)?.id || scenariosAffiches[0]?.id} className="mb-8">
            <TabsList className={`grid ${scenariosAffiches.length === 2 ? 'grid-cols-2' : 'grid-cols-4'} mb-6 no-print`}>
              {scenariosAffiches.map((scenario) => (
                <TabsTrigger 
                  key={scenario.id} 
                  value={scenario.id}
                  className="relative"
                >
                  <span>Scénario {scenario.id}</span>
                  {scenario.id === resultats.meilleurScenario && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-energy rounded-full" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {scenariosAffiches.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{scenario.nom}</CardTitle>
                          {scenario.statut === 'OK' ? (
                            <Badge className="bg-energy/10 text-energy border-0">
                              <Check className="w-3 h-3 mr-1" />
                              Réalisable
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Partiel
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{scenario.description}</CardDescription>
                      </div>
                      {scenario.capaciteBatterie && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Battery className="w-4 h-4" />
                          <span className="text-sm">Avec batterie</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Économies/an</span>
                        </div>
                        <p className="text-2xl font-bold">{formatShekel(scenario.economiesAnnuelles)}</p>
                        {scenario.revenusReventeAnnuels > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            dont {formatShekel(scenario.revenusReventeAnnuels)} de revente
                          </p>
                        )}
                      </div>
                      
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Production</span>
                        </div>
                        <p className="text-2xl font-bold">{formatNumber(scenario.productionAnnuelle)}</p>
                        <p className="text-xs text-muted-foreground mt-1">kWh/an</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Sun className="w-4 h-4" />
                          <span className="text-sm">Installation</span>
                        </div>
                        <p className="text-2xl font-bold">{scenario.nombrePanneaux}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          panneaux • {scenario.puissanceKwc} kWc
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <span className="text-sm">Surface nécessaire</span>
                        </div>
                        <p className="text-2xl font-bold">{scenario.surfaceNecessaire} m²</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {scenario.statut === 'PARTIEL' 
                            ? `Dépasse vos ${resultats.input.surfaceToit} m²` 
                            : `Sur vos ${resultats.input.surfaceToit} m² disponibles`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {scenario.capaciteBatterie && (
                      <div className="mt-6 p-4 rounded-xl bg-energy/5 border border-energy/20">
                        <div className="flex items-center gap-3">
                          <Battery className="w-5 h-5 text-energy" />
                          <div>
                            <p className="font-medium">Batterie de stockage</p>
                            <p className="text-sm text-muted-foreground">
                              Capacité : {scenario.capaciteBatterie} kWh • {scenario.equipement.batterie}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Équipement sélectionné :</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{scenario.equipement.panneau}</Badge>
                        <Badge variant="outline">{scenario.equipement.onduleur}</Badge>
                        {scenario.equipement.batterie && (
                          <Badge variant="outline">{scenario.equipement.batterie}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-energy" />
                  Scénarios réalisables ({scenariosOK.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenariosOK.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <span className="font-medium">Scénario {s.id}</span>
                        <span className="text-muted-foreground ml-2">— {s.nom}</span>
                      </div>
                      <span className="font-semibold">{formatShekel(s.economiesAnnuelles)}/an</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Scénarios partiels ({scenariosPartiels.length})
                </CardTitle>
                <CardDescription>
                  Surface de toit insuffisante pour une installation complète
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenariosPartiels.length > 0 ? (
                    scenariosPartiels.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <span className="font-medium">Scénario {s.id}</span>
                          <span className="text-muted-foreground ml-2">— {s.surfaceNecessaire} m² requis</span>
                        </div>
                        <span className="text-muted-foreground">{formatShekel(s.economiesAnnuelles)}/an</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Tous les scénarios sont réalisables !
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-primary text-primary-foreground no-print">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Un conseiller vous rappelle sous 24h
                  </h3>
                  <p className="opacity-90">
                    Pour affiner votre projet et obtenir un devis personnalisé
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Être rappelé
                  </Button>
                  <Button variant="secondary" size="lg" className="gap-2 bg-white/10 hover:bg-white/20 text-primary-foreground border-primary-foreground/30">
                    <Mail className="w-4 h-4" />
                    Nous contacter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recap données */}
          <div className="mt-8 p-6 rounded-xl bg-muted/50">
            <h4 className="font-medium mb-4">Récapitulatif de vos données</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Consommation</span>
                <p className="font-medium">{formatNumber(resultats.input.consoAnnuelle)} kWh/an</p>
              </div>
              <div>
                <span className="text-muted-foreground">Part jour</span>
                <p className="font-medium">{resultats.input.partJour}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Surface toit</span>
                <p className="font-medium">{resultats.input.surfaceToit} m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prix achat</span>
                <p className="font-medium">{resultats.input.prixAchatKwh} ₪/kWh</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prix revente</span>
                <p className="font-medium">{resultats.input.prixReventeKwh} ₪/kWh</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

