'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadsTable } from '@/components/leads-table'

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

      const activeCommercials = commercialsData.users
        .filter((u: any) => u.role === 'commercial' && u.actif)
        .map((u: any) => ({ id: u.id, prenom: u.prenom, nom: u.nom }))
      setCommercials(activeCommercials)

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
          </p>
        </div>
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
            <LeadsTable leads={leads} commercials={commercials} onLoadLeads={loadData} />
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

