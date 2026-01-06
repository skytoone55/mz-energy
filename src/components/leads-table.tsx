'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  UserPlus,
  Loader2,
  Check,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Lead {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  ville: string | null
  created_at: string
  simulationId: string | null
  commercialAssigne?: { id: string; prenom: string; nom: string } | null
}

interface Commercial {
  id: string
  prenom: string
  nom: string
}

interface LeadsTableProps {
  leads: Lead[]
  commercials: Commercial[]
}

export function LeadsTable({ leads: initialLeads, commercials }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [transferDialogOpen, setTransferDialogOpen] = useState<string | null>(null)
  const [selectedCommercial, setSelectedCommercial] = useState<string>('')
  const [transferring, setTransferring] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Recharger les leads quand ils changent
  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const handleTransfer = async (leadId: string) => {
    if (!selectedCommercial) {
      setError('Veuillez sélectionner un commercial')
      return
    }

    setTransferring(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/leads/${leadId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commercialId: selectedCommercial }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du transfert')
      }

      // Mettre à jour le lead localement
      setLeads(leads.map(lead => 
        lead.id === leadId
          ? {
              ...lead,
              commercialAssigne: commercials.find(c => c.id === selectedCommercial) 
                ? { 
                    id: selectedCommercial, 
                    prenom: commercials.find(c => c.id === selectedCommercial)!.prenom,
                    nom: commercials.find(c => c.id === selectedCommercial)!.nom
                  }
                : null
            }
          : lead
      ))

      setTransferDialogOpen(null)
      setSelectedCommercial('')
      
      // Recharger la page pour avoir les données à jour
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du transfert')
    } finally {
      setTransferring(false)
    }
  }

  const handleDeleteSimulation = async (simulationId: string, leadId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette simulation ? Cette action est irréversible.')) {
      return
    }

    setDeleting(simulationId)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard/simulations?id=${simulationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Mettre à jour localement en retirant la simulation
        setLeads(leads.map(lead => 
          lead.id === leadId
            ? { ...lead, simulationId: null }
            : lead
        ))
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const openTransferDialog = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead?.commercialAssigne) {
      setSelectedCommercial(lead.commercialAssigne.id)
    } else {
      setSelectedCommercial('')
    }
    setTransferDialogOpen(leadId)
    setError(null)
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Téléphone</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Ville</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Commercial</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Simulation</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-secondary/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{lead.prenom} {lead.nom}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {lead.telephone || '-'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {lead.ville || '-'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </td>
                <td className="p-4">
                  {lead.commercialAssigne ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" />
                      {lead.commercialAssigne.prenom} {lead.commercialAssigne.nom}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Non assigné</Badge>
                  )}
                </td>
                <td className="p-4">
                  {lead.simulationId ? (
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/simulation/${lead.simulationId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          Voir simulation
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSimulation(lead.simulationId!, lead.id)}
                        disabled={deleting === lead.simulationId}
                        title="Supprimer la simulation"
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === lead.simulationId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Aucune</span>
                  )}
                </td>
                <td className="p-4">
                  <Dialog open={transferDialogOpen === lead.id} onOpenChange={(open) => {
                    if (!open) {
                      setTransferDialogOpen(null)
                      setError(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTransferDialog(lead.id)}
                        className="gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assigner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assigner le lead à un commercial</DialogTitle>
                        <DialogDescription>
                          Sélectionnez le commercial qui sera responsable de ce lead
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Lead: {lead.prenom} {lead.nom}
                          </label>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Commercial</label>
                          <Select
                            value={selectedCommercial}
                            onValueChange={setSelectedCommercial}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un commercial" />
                            </SelectTrigger>
                            <SelectContent>
                              {commercials.map((commercial) => (
                                <SelectItem key={commercial.id} value={commercial.id}>
                                  {commercial.prenom} {commercial.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {error && (
                          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setTransferDialogOpen(null)
                            setError(null)
                          }}
                          disabled={transferring}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={() => handleTransfer(lead.id)}
                          disabled={transferring || !selectedCommercial}
                          className="bg-solar-gradient hover:opacity-90 text-white"
                        >
                          {transferring ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Attribution...
                            </>
                          ) : (
                            'Assigner'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

