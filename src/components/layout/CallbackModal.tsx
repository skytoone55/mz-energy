'use client'

import { useState } from 'react'
import { X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CallbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallbackModal({ open, onOpenChange }: CallbackModalProps) {
  const [formData, setFormData] = useState({
    prenom: '',
    telephone: '',
    type: '',
    creneau: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validation manuelle des champs requis
    if (!formData.type) {
      alert('Veuillez sélectionner votre profil.')
      setSubmitting(false)
      return
    }

    // TODO: Intégrer avec l'API pour créer un lead
    // Pour l'instant, simulation d'un envoi
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitting(false)
    setSubmitted(true)

    setTimeout(() => {
      setSubmitted(false)
      onOpenChange(false)
      setFormData({ prenom: '', telephone: '', type: '', creneau: '' })
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Être rappelé</DialogTitle>
          <DialogDescription>
            Laissez vos coordonnées, nous vous rappelons sous 24h
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Merci !</p>
            <p className="text-sm text-muted-foreground mt-2">
              Nous vous rappelons très bientôt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Votre prénom"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="05X XXX XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Je suis *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particulier">Particulier</SelectItem>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creneau">Créneau préféré</Label>
              <Select
                value={formData.creneau}
                onValueChange={(value) => setFormData({ ...formData, creneau: value })}
              >
                <SelectTrigger id="creneau">
                  <SelectValue placeholder="Peu importe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peu-importe">Peu importe</SelectItem>
                  <SelectItem value="matin">Matin</SelectItem>
                  <SelectItem value="apres-midi">Après-midi</SelectItem>
                  <SelectItem value="soir">Soir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-solar-gradient hover:opacity-90 text-white"
              disabled={submitting}
            >
              {submitting ? 'Envoi en cours...' : 'Demander un rappel'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

