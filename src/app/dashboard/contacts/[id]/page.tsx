'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, FileText, Edit2, Trash2, Plus, Save, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { T } from '@/components/T'

interface Contact {
  id: string
  nom: string
  prenom: string
  telephone?: string
  email?: string
  notes?: string
  adresse?: string | null
  ville?: string | null
}

interface Simulation {
  id: string
  nom_projet: string
  created_at: string
  statut: string
  validated_at?: string
  conso_annuelle?: number
  surface_toit?: number
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const [contact, setContact] = useState<Contact | null>(null)
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContact()
  }, [contactId])

  const loadContact = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contacts/${contactId}`)
      const data = await response.json()
      if (data.contact) {
        setContact(data.contact)
        setFormData(data.contact)
      }
      if (data.simulations) {
        setSimulations(data.simulations)
      }
    } catch (error) {
      console.error('Erreur chargement contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return
    setSaving(true)
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setContact(formData)
        setEditing(false)
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/dashboard/contacts')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground"><T>Chargement...</T></p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground"><T>Contact non trouvé</T></p>
        <Link href="/dashboard/contacts">
          <Button variant="outline" className="mt-4">
            <T>Retour aux contacts</T>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <T>Retour</T>
          </Button>
        </Link>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => {
                setEditing(false)
                setFormData(contact)
              }}>
                <T>Annuler</T>
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? <T>Enregistrement...</T> : <T>Enregistrer</T>}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                <T>Modifier</T>
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                <T>Supprimer</T>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Infos contact */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle><T>Informations</T></CardTitle>
                <div className="w-12 h-12 rounded-full bg-solar-gradient flex items-center justify-center text-white font-semibold text-lg">
                  {contact.prenom[0]}{contact.nom[0]}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={formData?.prenom || ''}
                      onChange={(e) => setFormData({ ...formData!, prenom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={formData?.nom || ''}
                      onChange={(e) => setFormData({ ...formData!, nom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData?.telephone || ''}
                      onChange={(e) => setFormData({ ...formData!, telephone: e.target.value })}
                      placeholder="0501234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => setFormData({ ...formData!, email: e.target.value })}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input
                      value={formData?.adresse || ''}
                      onChange={(e) => setFormData({ ...formData!, adresse: e.target.value })}
                      placeholder="Numéro et rue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={formData?.ville || ''}
                      onChange={(e) => setFormData({ ...formData!, ville: e.target.value })}
                      placeholder="Ville" // Traduit automatiquement par Input
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (Informations sur le client)</Label>
                    <Textarea
                      value={formData?.notes || ''}
                      onChange={(e) => setFormData({ ...formData!, notes: e.target.value })}
                      rows={5}
                      placeholder="Ajoutez des informations sur le client, ses préférences, remarques, etc..." // Traduit automatiquement par Textarea
                      className="resize-y"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Prénom</Label>
                    <p className="font-medium">{contact.prenom}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nom</Label>
                    <p className="font-medium">{contact.nom}</p>
                  </div>
                  {contact.telephone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.telephone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {(contact.adresse || contact.ville) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        {contact.adresse && (
                          <p className="font-medium">{contact.adresse}</p>
                        )}
                        {contact.ville && (
                          <p className="text-sm text-muted-foreground">{contact.ville}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <Label className="text-muted-foreground mb-2 block">Notes</Label>
                    {contact.notes ? (
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{contact.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic"><T>Aucune note ajoutée</T></p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Simulations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Simulations</CardTitle>
                  <CardDescription>
                    {simulations.length} simulation{simulations.length > 1 ? 's' : ''} associée{simulations.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Link href={`/dashboard/simulation/nouvelle?contactId=${contactId}`}>
                  <Button size="sm" className="bg-solar-gradient hover:opacity-90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    <T>Nouvelle simulation</T>
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {simulations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4"><T>Aucune simulation pour ce contact</T></p>
                  <Link href={`/dashboard/simulation/nouvelle?contactId=${contactId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      <T>Créer une simulation</T>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {simulations.map((sim) => (
                    <Link key={sim.id} href={`/dashboard/simulation/${sim.id}`}>
                      <div className="p-4 rounded-lg border hover:bg-secondary transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{sim.nom_projet}</h4>
                              {sim.statut === 'validee' && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700">
                                  <T>Validée</T>
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground"><T>Date de création</T></p>
                                <p className="font-medium">
                                  {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              {sim.surface_toit && (
                                <div>
                                  <p className="text-muted-foreground"><T>Surface toit</T></p>
                                  <p className="font-medium">{sim.surface_toit} m²</p>
                                </div>
                              )}
                              {sim.conso_annuelle && (
                                <div>
                                  <p className="text-muted-foreground"><T>Consommation</T></p>
                                  <p className="font-medium">{sim.conso_annuelle.toLocaleString()} kWh/an</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <FileText className="w-4 h-4 text-muted-foreground ml-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
