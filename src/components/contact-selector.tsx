'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Contact {
  id: string
  nom: string
  prenom: string
  telephone?: string
  email?: string
  notes?: string
}

interface ContactSelectorProps {
  selectedContactId?: string | null
  onContactSelect: (contactId: string | null) => void
  onContactCreate: (contact: Omit<Contact, 'id'>) => Promise<string>
}

export function ContactSelector({
  selectedContactId,
  onContactSelect,
  onContactCreate,
}: ContactSelectorProps) {
  const [mode, setMode] = useState<'select' | 'create'>('select')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Formulaire de création
  const [newContact, setNewContact] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    notes: '',
  })

  const supabase = createClient()

  // Charger les contacts
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contacts?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      if (data.contacts) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Erreur chargement contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'select') {
        loadContacts()
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search, mode])

  const handleCreateContact = async () => {
    if (!newContact.nom || !newContact.prenom) {
      return
    }

    setCreating(true)
    try {
      const contactId = await onContactCreate({
        nom: newContact.nom,
        prenom: newContact.prenom,
        telephone: newContact.telephone || undefined,
        email: newContact.email || undefined,
        notes: newContact.notes || undefined,
      })
      await loadContacts()
      onContactSelect(contactId)
      setMode('select')
      setNewContact({ nom: '', prenom: '', telephone: '', email: '', notes: '' })
    } catch (error) {
      console.error('Erreur création contact:', error)
    } finally {
      setCreating(false)
    }
  }

  if (mode === 'create') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-solar" />
            Créer un nouveau contact
          </CardTitle>
          <CardDescription>
            Ajoutez les informations du client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-nom">Nom *</Label>
            <Input
              id="new-nom"
              value={newContact.nom}
              onChange={(e) => setNewContact({ ...newContact, nom: e.target.value })}
              placeholder="Cohen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-prenom">Prénom *</Label>
            <Input
              id="new-prenom"
              value={newContact.prenom}
              onChange={(e) => setNewContact({ ...newContact, prenom: e.target.value })}
              placeholder="David"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-telephone">Téléphone</Label>
            <Input
              id="new-telephone"
              type="tel"
              value={newContact.telephone}
              onChange={(e) => setNewContact({ ...newContact, telephone: e.target.value })}
              placeholder="0501234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="david@example.com"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setMode('select')
                setNewContact({ nom: '', prenom: '', telephone: '', email: '', notes: '' })
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="flex-1 bg-solar-gradient hover:opacity-90 text-white"
              onClick={handleCreateContact}
              disabled={creating || !newContact.nom || !newContact.prenom}
            >
              {creating ? 'Création...' : 'Créer le contact'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-solar" />
          Sélectionner ou créer un contact
        </CardTitle>
        <CardDescription>
          Choisissez un contact existant ou créez-en un nouveau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Bouton créer */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setMode('create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un nouveau contact
        </Button>

        {/* Liste des contacts */}
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chargement...
          </p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun contact trouvé
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => onContactSelect(contact.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedContactId === contact.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-secondary border-border'
                }`}
              >
                <div className="font-medium">
                  {contact.prenom} {contact.nom}
                </div>
                {contact.email && (
                  <div className="text-sm opacity-80">{contact.email}</div>
                )}
                {contact.telephone && (
                  <div className="text-sm opacity-80">{contact.telephone}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Option "Pas de contact" pour l'instant */}
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => onContactSelect(null)}
        >
          Continuer sans contact
        </Button>
      </CardContent>
    </Card>
  )
}
