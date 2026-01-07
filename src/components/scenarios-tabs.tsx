'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Clock, TrendingUp, Sun, Zap, Battery, Star } from 'lucide-react'
import { formatShekel, formatNumber } from '@/lib/pv-engine'
import type { ScenarioWithPrice } from '@/lib/price-engine'

interface ScenarioLabels {
  [key: string]: {
    name: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }
}

interface ScenariosTabsProps {
  scenarios: ScenarioWithPrice[]
  meilleurScenario: string
  surfaceToit: number
  onActiveTabChange?: (scenarioIds: string[]) => void
}

export function ScenariosTabs({ scenarios, meilleurScenario, surfaceToit, onActiveTabChange }: ScenariosTabsProps) {
  const scenarioLabels: ScenarioLabels = {
    A: { 
      name: 'Autoconsommation Jour', 
      description: 'Couvre uniquement la consommation de jour',
      icon: Sun,
      color: '#FEF3C7'
    },
    B: { 
      name: 'Jour + Revente', 
      description: 'Couvre le jour + vend le surplus au réseau',
      icon: Zap,
      color: '#FFEDD5'
    },
    C: { 
      name: 'Autonomie Totale', 
      description: 'Couvre jour + nuit (autonomie maximale)',
      icon: Battery,
      color: '#DBEAFE'
    },
    D: { 
      name: 'Autonomie + Revente', 
      description: 'Couvre tout + vend le surplus restant',
      icon: Star,
      color: '#D1FAE5'
    },
    'D-2': {
      name: 'Revente Prioritaire',
      description: 'Revente prioritaire quand PARTIEL',
      icon: TrendingUp,
      color: '#A7F3D0'
    },
  }

  // Récupérer la surface requise pour le scénario C
  const scenarioC = scenarios.find(s => s.id === 'C')
  const scenarioD = scenarios.find(s => s.id === 'D')
  const surfaceRequiseC = scenarioC?.surfaceNecessaire || Infinity

  // Déterminer les scénarios recommandés
  // Si surface < surface requise pour C : A et B
  // Sinon : C et (D si D est OK, sinon D-2 si visible)
  const scenariosRecommandes = surfaceToit < surfaceRequiseC
    ? scenarios.filter(s => s.id === 'A' || s.id === 'B')
    : scenarios.filter(s => {
        if (s.id === 'C') return true
        // Si D est OK, afficher D (pas D-2 qui serait identique)
        if (scenarioD?.statut === 'OK' && s.id === 'D') return true
        // Sinon, afficher D-2 s'il est visible (différent de D)
        if (scenarioD?.statut !== 'OK' && s.id === 'D-2' && s.showInResults !== false) return true
        return false
      })

  // Scénarios économiques (alternatifs si hybride est possible)
  const scenariosEconomiques = surfaceToit >= surfaceRequiseC
    ? scenarios.filter(s => s.id === 'A' || s.id === 'B')
    : []

  // Afficher les onglets seulement si des scénarios économiques existent
  const showTabs = scenariosEconomiques.length > 0

  // Notifier le parent des scénarios affichés quand l'onglet change
  const handleTabChange = (value: string) => {
    const activeScenarios = value === 'recommandes' ? scenariosRecommandes : scenariosEconomiques
    if (onActiveTabChange) {
      onActiveTabChange(activeScenarios.map(s => s.id))
    }
  }

  const renderScenarioCard = (scenario: ScenarioWithPrice) => {
    const info = scenarioLabels[scenario.id]
    if (!info) return null

    const isMeilleur = scenario.id === meilleurScenario
    const Icon = info.icon

    return (
      <Card 
        key={scenario.id}
        className={isMeilleur ? 'ring-2 ring-primary' : ''}
        style={{
          borderLeft: `4px solid ${info.color}`
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${info.color}80` }}
              >
                <div style={{ color: info.color }}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">
                  Scénario {scenario.id}: {info.name}
                </CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </div>
            </div>
            {isMeilleur && (
              <Badge className="bg-primary text-white">
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
  }

  // Notifier le parent au montage initial avec les scénarios recommandés
  useEffect(() => {
    if (onActiveTabChange) {
      onActiveTabChange(scenariosRecommandes.map(s => s.id))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (showTabs) {
    return (
      <Tabs defaultValue="recommandes" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 gap-2">
          <TabsTrigger 
            value="recommandes" 
            className="data-[state=active]:bg-[#F59E0B] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-[#F59E0B]/50 transition-all"
          >
            Recommandé
          </TabsTrigger>
          <TabsTrigger 
            value="economique" 
            className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-[#22C55E]/50 transition-all"
          >
            Économique
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommandes">
          <div className="grid gap-6 md:grid-cols-2">
            {scenariosRecommandes.map(renderScenarioCard)}
          </div>
        </TabsContent>
        <TabsContent value="economique">
          <div className="grid gap-6 md:grid-cols-2">
            {scenariosEconomiques.map(renderScenarioCard)}
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  // Pas d'onglets, afficher directement les scénarios recommandés
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {scenariosRecommandes.map(renderScenarioCard)}
    </div>
  )
}

