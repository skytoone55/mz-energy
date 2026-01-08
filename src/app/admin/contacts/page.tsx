'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, Phone, Mail, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { T } from '@/components/T'

interface Contact {
  id: string
  nom: string
  prenom: string
  telephone?: string
  email?: string
  notes?: string
  nb_simulations?: number
  type?: 'contact' | 'lead'
  lead_id?: string
  commercial?: {
    id: string
    prenom: string
    nom: string
    email: string
  }
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContacts()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold"><T>Tous les contacts</T></h1>
        <p className="text-muted-foreground mt-1">
          <T>Vue globale de tous les contacts commerciaux</T>
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 rtl:left-auto rtl:right-3" />
        <Input
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rtl:pl-0 rtl:pr-10"
        />
      </div>

      {/* Contacts list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground"><T>Chargement...</T></p>
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground"><T>Aucun contact trouvé</T></p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Link 
              key={contact.id} 
              href={contact.type === 'lead' 
                ? `/admin/leads`
                : `/dashboard/contacts/${contact.id.replace('lead_', '')}`
              }
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {contact.prenom} {contact.nom}
                        </h3>
                        {contact.type === 'lead' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Lead
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Contact
                          </Badge>
                        )}
                      </div>
                      {contact.commercial && (
                        <p className="text-sm text-muted-foreground">
                          <T>Commercial</T>: {contact.commercial.prenom} {contact.commercial.nom}
                        </p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-solar-gradient flex items-center justify-center text-white font-semibold">
                      {contact.prenom[0]}{contact.nom[0]}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                    )}
                    {contact.telephone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {contact.telephone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-solar">
                      <FileText className="w-4 h-4" />
                      {contact.nb_simulations || 0} <T>simulation{(contact.nb_simulations || 0) > 1 ? 's' : ''}</T>
                    </div>
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
