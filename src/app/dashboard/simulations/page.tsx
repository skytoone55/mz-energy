'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  FolderOpen, 
  Plus,
  Calendar,
  Pencil,
  Loader2,
  User,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatShekel, formatNumber } from '@/lib/pv-engine'
import { SimulationsFilters } from '@/components/simulations-filters'

interface SimulationResultats {
  scenarios: Array<{ economiesAnnuelles: number; id: string; prixTTC?: number }>
  meilleurScenario: string
}

interface Commercial {
  id: string
  prenom: string
  nom: string
  email: string
}

interface Simulation {
  id: string
  nom_projet: string | null
  conso_annuelle: number
  surface_toit: number
  created_at: string
  resultats: SimulationResultats
  user_profiles?: { prenom: string; nom: string; email: string } | null
  leads?: { prenom: string; nom: string; email: string; telephone: string | null } | null
  user_id: string | null
}

export default function SimulationsListPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [commercials, setCommercials] = useState<Commercial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState<{ commercialId: string | null; search: string }>({
    commercialId: null,
    search: ''
  })

  // Charger les données
  useEffect(() => {
    if (isAdmin && commercials.length === 0) {
      loadCommercials()
    }
  }, [isAdmin, commercials.length])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.commercialId, filters.search])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger les simulations avec filtres
      const params = new URLSearchParams()
      if (filters.commercialId) {
        params.append('commercialId', filters.commercialId)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }

      const simulationsRes = await fetch(`/api/dashboard/simulations?${params.toString()}`, {
        cache: 'no-store'
      })
      const simulationsData = await simulationsRes.json()

      if (simulationsRes.ok) {
        setSimulations(simulationsData.simulations || [])
        setIsAdmin(!!simulationsData.isAdmin)
      } else {
        setError(simulationsData.error || 'Erreur lors du chargement')
      }
    } catch (error) {
      console.error('Erreur chargement simulations:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const loadCommercials = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      
      if (res.ok && data.users) {
        // Filtrer uniquement les commerciaux actifs
        const activeCommercials = data.users
          .filter((u: any) => u.role === 'commercial' && u.actif)
          .map((u: any) => ({
            id: u.id,
            prenom: u.prenom,
            nom: u.nom,
            email: u.email,
          }))
        setCommercials(activeCommercials)
      }
    } catch (error) {
      console.error('Erreur chargement commerciaux:', error)
    }
  }

  const handleFiltersChange = useCallback((newFilters: { commercialId: string | null; search: string }) => {
    setFilters(prev => {
      // Ne mettre à jour que si les valeurs ont changé pour éviter les boucles
      if (prev.commercialId === newFilters.commercialId && prev.search === newFilters.search) {
        return prev
      }
      return newFilters
    })
    // Réinitialiser la sélection quand on change les filtres
    setSelectedIds(new Set())
  }, [])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === simulations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(simulations.map(s => s.id)))
    }
  }

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${ids.length} simulation(s) ? Cette action est irréversible.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/dashboard/simulations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (response.ok) {
        setSelectedIds(new Set())
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      setError('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {loading ? 'Chargement...' : (isAdmin ? 'Toutes les simulations' : 'Mes simulations')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {simulations.length} simulation{(simulations.length > 1 ? 's' : '')} au total
            {selectedIds.size > 0 && ` • ${selectedIds.size} sélectionnée(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(Array.from(selectedIds))}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer ({selectedIds.size})
                </>
              )}
            </Button>
          )}
          <Link href="/dashboard/simulation/nouvelle">
            <Button className="bg-solar-gradient hover:opacity-90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle simulation
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Filtres */}
      <SimulationsFilters
        commercials={commercials}
        isAdmin={isAdmin}
        onFiltersChange={handleFiltersChange}
      />

      {/* Sélection globale */}
      {simulations.length > 0 && (
        <div className="flex items-center gap-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectAll}
            className="gap-2"
          >
            {selectedIds.size === simulations.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedIds.size === simulations.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        </div>
      )}

      {/* Simulations List */}
      {simulations && simulations.length > 0 ? (
        <div className="space-y-4">
          {simulations.map((sim) => {
            const isSelected = selectedIds.has(sim.id)
            const resultats = sim.resultats as SimulationResultats
            const meilleur = resultats.scenarios.find(s => s.id === resultats.meilleurScenario)
            
            return (
              <Card key={sim.id} className={`hover:bg-secondary/30 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleSelection(sim.id)}
                        className="shrink-0 mt-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <Link href={`/dashboard/simulation/${sim.id}`} className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center shrink-0">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {sim.nom_projet || `Simulation #${sim.id.slice(0, 8)}`}
                          </h3>
                          {isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              {sim.user_profiles 
                                ? `${sim.user_profiles.prenom} ${sim.user_profiles.nom}`
                                : sim.leads
                                ? `${sim.leads.prenom} ${sim.leads.nom} (Lead)`
                                : 'Non assigné'
                              }
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span>{formatNumber(sim.conso_annuelle)} kWh/an</span>
                          <span>•</span>
                          <span>{sim.surface_toit} m²</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Économies</p>
                        <p className="text-lg font-bold text-energy">
                          {formatShekel(meilleur?.economiesAnnuelles || 0)}/an
                        </p>
                      </div>
                      {meilleur?.prixTTC && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Prix TTC</p>
                          <p className="text-lg font-bold text-solar">
                            {formatShekel(meilleur.prixTTC)}
                          </p>
                        </div>
                      )}
                      <Badge variant="secondary" className="shrink-0">
                        Scénario {resultats.meilleurScenario}
                      </Badge>
                      <Link href={`/dashboard/simulation/${sim.id}/modifier`}>
                        <Button variant="ghost" size="icon" title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete([sim.id])}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune simulation</h3>
            <p className="text-muted-foreground text-center mb-6">
              {isAdmin && filters.commercialId || filters.search
                ? 'Aucune simulation ne correspond aux filtres'
                : 'Créez votre première simulation pour commencer'
              }
            </p>
            {(!isAdmin || (!filters.commercialId && !filters.search)) && (
              <Link href="/dashboard/simulation/nouvelle">
                <Button className="bg-solar-gradient hover:opacity-90 text-white">
                  Créer une simulation
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
