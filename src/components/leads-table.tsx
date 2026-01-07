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
  Trash2,
  Pencil
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

interface LeadsTableProps {
  leads: Lead[]
  commercials: Commercial[]
  onLoadLeads?: () => void
}

export function LeadsTable({ leads: initialLeads, commercials, onLoadLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [transferDialogOpen, setTransferDialogOpen] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [selectedCommercial, setSelectedCommercial] = useState<string>('')
  const [transferring, setTransferring] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // État pour l'édition
  const [editingLead, setEditingLead] = useState<Partial<Lead> | null>(null)

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

  const openEditDialog = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setEditingLead({
        id: lead.id,
        prenom: lead.prenom,
        nom: lead.nom,
        email: lead.email,
        telephone: lead.telephone || '',
        ville: lead.ville || '',
        notes: lead.notes || '',
      })
      setEditDialogOpen(leadId)
      setError(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingLead || !editingLead.id) return
    
    if (!editingLead.prenom || !editingLead.nom || !editingLead.email) {
      setError('Prénom, nom et email sont requis')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/leads/${editingLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: editingLead.prenom,
          nom: editingLead.nom,
          email: editingLead.email,
          telephone: editingLead.telephone || null,
          ville: editingLead.ville || null,
          notes: editingLead.notes || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification')
      }

      setEditDialogOpen(null)
      setEditingLead(null)
      
      // Recharger les leads
      if (onLoadLeads) {
        onLoadLeads()
      } else {
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    setDeleting(leadId)
    setError(null)

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      setDeleteDialogOpen(null)
      
      // Recharger les leads
      if (onLoadLeads) {
        onLoadLeads()
      } else {
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
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
                  <div className="flex items-center gap-2">
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(lead.id)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </Button>

                    <Dialog open={editDialogOpen === lead.id} onOpenChange={(open) => {
                      if (!open) {
                        setEditDialogOpen(null)
                        setEditingLead(null)
                        setError(null)
                      }
                    }}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le lead</DialogTitle>
                          <DialogDescription>
                            Modifiez les informations du lead
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-prenom">Prénom *</Label>
                              <Input
                                id="edit-prenom"
                                value={editingLead?.prenom || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, prenom: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-nom">Nom *</Label>
                              <Input
                                id="edit-nom"
                                value={editingLead?.nom || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, nom: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editingLead?.email || ''}
                              onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-telephone">Téléphone</Label>
                              <Input
                                id="edit-telephone"
                                value={editingLead?.telephone || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, telephone: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-ville">Ville</Label>
                              <Input
                                id="edit-ville"
                                value={editingLead?.ville || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, ville: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                              id="edit-notes"
                              value={editingLead?.notes || ''}
                              onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                              rows={3}
                            />
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
                              setEditDialogOpen(null)
                              setEditingLead(null)
                              setError(null)
                            }}
                            disabled={saving}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            disabled={saving || !editingLead?.prenom || !editingLead?.nom || !editingLead?.email}
                            className="bg-solar-gradient hover:opacity-90 text-white"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              'Enregistrer'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={deleteDialogOpen === lead.id} onOpenChange={(open) => {
                      if (!open) {
                        setDeleteDialogOpen(null)
                        setError(null)
                      }
                    }}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Supprimer le lead</DialogTitle>
                          <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce lead ? Cette action est irréversible.
                            {lead.simulationId && ' La simulation associée sera également supprimée.'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {error && (
                          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setDeleteDialogOpen(null)
                              setError(null)
                            }}
                            disabled={deleting === lead.id}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteLead(lead.id)}
                            disabled={deleting === lead.id}
                          >
                            {deleting === lead.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Suppression...
                              </>
                            ) : (
                              'Supprimer'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(lead.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

