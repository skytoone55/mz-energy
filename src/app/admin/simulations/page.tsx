'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  FolderOpen, 
  Plus,
  Calendar,
  Pencil,
  Loader2,
  UserPlus,
  Check,
  Search,
  ExternalLink,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatShekel, formatNumber } from '@/lib/pv-engine'
import { SimulationsFilters } from '@/components/simulations-filters'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  type: string
}

export default function AdminSimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [commercials, setCommercials] = useState<Commercial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState<{ commercialId: string | null; search: string }>({
    commercialId: null,
    search: ''
  })
  
  // État pour l'assignation
  const [assignDialogOpen, setAssignDialogOpen] = useState<string | null>(null)
  const [selectedCommercial, setSelectedCommercial] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadCommercials()
  }, [])

  useEffect(() => {
    loadData()
  }, [filters.commercialId, filters.search])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.commercialId) params.append('commercialId', filters.commercialId)
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`/api/dashboard/simulations?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setSimulations(data.simulations || [])
      }
    } catch (error) {
      console.error('Erreur chargement simulations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCommercials = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (res.ok && data.users) {
        setCommercials(data.users.filter((u: any) => u.role === 'commercial' && u.actif))
      }
    } catch (error) {
      console.error('Erreur commerciaux:', error)
    }
  }

  const handleAssign = async (simId: string) => {
    if (!selectedCommercial) return
    setAssigning(true)
    try {
      const response = await fetch(`/api/admin/leads/${simId}/transfer`, { // On réutilise l'API de transfert qui prend un ID de simulation
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commercialId: selectedCommercial }),
      })
      if (response.ok) {
        setAssignDialogOpen(null)
        loadData()
      }
    } catch (error) {
      console.error('Erreur assignation:', error)
    } finally {
      setAssigning(false)
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
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && simulations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" />
            Toutes les simulations
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
        </div>
      </div>

      <SimulationsFilters
        commercials={commercials}
        isAdmin={true}
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

      <div className="space-y-4">
        {simulations.map((sim) => {
          const isSelected = selectedIds.has(sim.id)
          const resultats = sim.resultats as SimulationResultats
          const meilleur = resultats.scenarios.find(s => s.id === resultats.meilleurScenario)
          
            return (
              <Card key={sim.id} className={`hover:bg-secondary/30 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {sim.nom_projet || `Simulation #${sim.id.slice(0, 8)}`}
                        </h3>
                        <Badge variant={sim.type === 'commercial' ? 'default' : 'secondary'}>
                          {sim.type === 'commercial' ? 'Commercial' : 'Particulier'}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white/50">
                          {sim.user_profiles 
                            ? `${sim.user_profiles.prenom} ${sim.user_profiles.nom}`
                            : sim.leads
                            ? `${sim.leads.prenom} ${sim.leads.nom} (Lead)`
                            : 'Non assigné'
                          }
                        </Badge>
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
                    
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
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
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Bouton Assigner */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          setAssignDialogOpen(sim.id)
                          setSelectedCommercial(sim.user_id || '')
                        }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Assigner
                      </Button>

                      {/* Bouton Modifier */}
                      <Link href={`/dashboard/simulation/${sim.id}/modifier`}>
                        <Button variant="ghost" size="icon" title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Bouton Voir */}
                      <Link href={`/dashboard/simulation/${sim.id}`}>
                        <Button variant="ghost" size="icon" title="Voir les détails">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Bouton Supprimer */}
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
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog d'assignation */}
      <Dialog open={!!assignDialogOpen} onOpenChange={(open) => !open && setAssignDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner la simulation</DialogTitle>
            <DialogDescription>
              Choisissez le commercial responsable de cette simulation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCommercial} onValueChange={setSelectedCommercial}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un commercial" />
              </SelectTrigger>
              <SelectContent>
                {commercials.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.prenom} {c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(null)}>Annuler</Button>
            <Button 
              onClick={() => assignDialogOpen && handleAssign(assignDialogOpen)}
              disabled={assigning || !selectedCommercial}
              className="bg-solar-gradient text-white"
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
