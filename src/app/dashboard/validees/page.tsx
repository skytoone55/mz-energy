'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, FileText, Calendar, CheckCircle2, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/components/T'

interface Lead {
  prenom: string
  nom: string
  email?: string
  telephone?: string
}

interface Contact {
  prenom: string
  nom: string
  email?: string
  telephone?: string
}

interface Simulation {
  id: string
  nom_projet: string
  created_at: string
  validated_at: string
  conso_annuelle: number
  surface_toit: number
  statut: string
  leads?: Lead
  contacts?: Contact
}

export default function ValideesPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadSimulations()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSimulations()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  const loadSimulations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ statut: 'validee' })
      if (search) {
        params.append('search', search)
      }
      const response = await fetch(`/api/dashboard/simulations?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = await response.json()
      if (data.simulations) {
        setSimulations(data.simulations)
      }
    } catch (error) {
      console.error('Erreur chargement simulations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold"><T>Simulations validées</T></h1>
          <p className="text-muted-foreground mt-1">
            <T>Simulations marquées comme "Client signé"</T>
          </p>
        </div>
        <Link href="/dashboard/simulation/nouvelle">
          <Button className="bg-solar-gradient hover:opacity-90 text-white">
            <T>Nouvelle simulation</T>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 rtl:left-auto rtl:right-3" />
        <Input
          placeholder="Rechercher une simulation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rtl:pl-0 rtl:pr-10"
        />
      </div>

      {/* Simulations list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground"><T>Chargement...</T></p>
        </div>
      ) : simulations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2"><T>Aucune simulation validée</T></p>
            <p className="text-sm text-muted-foreground">
              {search ? <T>Essayez une autre recherche</T> : <T>Les simulations validées apparaîtront ici</T>}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {simulations.map((sim) => (
            <Link key={sim.id} href={`/dashboard/simulation/${sim.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{sim.nom_projet}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <T>Validée</T>
                        </span>
                      </div>
                      
                      {/* Informations contact/lead */}
                      {(sim.contacts || sim.leads) && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground"><T>Contact</T></span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">
                              {(sim.contacts || sim.leads)?.prenom} {(sim.contacts || sim.leads)?.nom}
                            </span>
                            {(sim.contacts || sim.leads)?.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{(sim.contacts || sim.leads)?.email}</span>
                              </div>
                            )}
                            {(sim.contacts || sim.leads)?.telephone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{(sim.contacts || sim.leads)?.telephone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground"><T>Consommation</T></p>
                          <p className="font-medium">{sim.conso_annuelle.toLocaleString()} kWh/an</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground"><T>Surface</T></p>
                          <p className="font-medium">{sim.surface_toit} m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground"><T>Créée le</T></p>
                          <p className="font-medium">
                            {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground"><T>Validée le</T></p>
                          <p className="font-medium">
                            {new Date(sim.validated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
