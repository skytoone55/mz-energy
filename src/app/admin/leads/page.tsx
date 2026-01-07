'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadsTable } from '@/components/leads-table'
import { Button } from '@/components/ui/button'

interface Lead {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  ville: string | null
  notes?: string | null
  created_at: string
  simulationId: string | null
  commercialAssigne?: { id: string; prenom: string; nom: string } | null
}

interface Commercial {
  id: string
  prenom: string
  nom: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [commercials, setCommercials] = useState<Commercial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  
  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch leads
      const leadsRes = await fetch('/api/admin/leads', { cache: 'no-store' })
      const leadsData = await leadsRes.json()
      if (!leadsRes.ok) throw new Error(leadsData.error || 'Failed to fetch leads')

      // Fetch commercials
      const commercialsRes = await fetch('/api/admin/users', { cache: 'no-store' })
      const commercialsData = await commercialsRes.json()
      if (!commercialsRes.ok) throw new Error(commercialsData.error || 'Failed to fetch commercials')

      // Inclure tous les utilisateurs actifs (commerciaux ET administrateurs)
      const activeUsers = commercialsData.users
        .filter((u: any) => (u.role === 'commercial' || u.role === 'admin') && u.actif)
        .map((u: any) => ({ id: u.id, prenom: u.prenom, nom: u.nom }))
      setCommercials(activeUsers)

      // Les leads sont déjà formatés par l'API
      setLeads(leadsData.leads)

    } catch (err) {
      console.error('Error loading admin leads data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} lead(s) ? Cette action est irréversible.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      setSelectedIds(new Set())
      loadData()
    } catch (err) {
      console.error('Erreur suppression leads:', err)
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Gestion des Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} lead{(leads.length > 1 ? 's' : '')} au total
            {selectedIds.size > 0 && ` • ${selectedIds.size} sélectionné(s)`}
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const week = new Date()
                week.setDate(week.getDate() - 7)
                return date >= week
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const today = new Date()
                return date.toDateString() === today.toDateString()
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des leads</CardTitle>
          <CardDescription>Tous les particuliers ayant effectué une simulation</CardDescription>
        </CardHeader>
        <CardContent>
          {leads && leads.length > 0 ? (
            <LeadsTable 
              leads={leads} 
              commercials={commercials} 
              onLoadLeads={loadData}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">Aucun lead</h3>
              <p className="text-sm text-muted-foreground">
                Les leads apparaîtront ici après les premières simulations
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

