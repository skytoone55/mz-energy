'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FAQ } from '@/components/ui/faq'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    type: '',
    sujet: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'envoi')
      }

      setSubmitted(true)
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        type: '',
        sujet: '',
        message: '',
      })

      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground">
            Une question ? Un projet ? Notre équipe est là pour vous accompagner.
          </p>
        </div>
      </section>

      {/* Section 2 - Formulaire de contact */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              {submitted ? (
                <div className="p-8 text-center bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-lg font-medium text-green-600 mb-2">
                    Merci pour votre message !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nous vous répondons sous 24h.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Je suis *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
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
                    <Label htmlFor="sujet">Sujet *</Label>
                    <Select
                      value={formData.sujet}
                      onValueChange={(value) => setFormData({ ...formData, sujet: value })}
                      required
                    >
                      <SelectTrigger id="sujet">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">Question générale</SelectItem>
                        <SelectItem value="devis">Demande de devis</SelectItem>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="partenariat">Partenariat</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-solar-gradient hover:opacity-90 text-white"
                    disabled={submitting}
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Informations de contact */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                      <Image
                        src="/images/contact/contact_01_support_client.jpg"
                        alt="Support client"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Adresse</div>
                          <div className="text-sm text-muted-foreground">[À définir]</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Téléphone</div>
                          <div className="text-sm text-muted-foreground">+972 XX XXX XXXX</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Email</div>
                          <a href="mailto:contact@mz-energy.co.il" className="text-sm text-primary hover:underline">
                            contact@mz-energy.co.il
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Horaires</div>
                          <div className="text-sm text-muted-foreground">
                            Dimanche - Jeudi : 9h00 - 18h00<br />
                            Vendredi - Samedi : Fermé
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Nos bureaux */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/contact/contact_02_bureaux_equipe.jpg"
                alt="Nos bureaux"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Nos bureaux
              </h2>
              <p className="text-muted-foreground mb-6">
                Vous souhaitez nous rencontrer ? Notre équipe vous accueille sur rendez-vous dans nos locaux.
              </p>
              <Button variant="outline">
                Prendre rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - FAQ rapide */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
          </div>

          <FAQ
            items={[
              {
                question: 'Quel est le délai de réponse ?',
                answer: 'Nous répondons à toutes les demandes sous 24h ouvrées.',
              },
              {
                question: 'Pouvez-vous vous déplacer pour une étude ?',
                answer: 'Oui, nous nous déplaçons gratuitement dans tout Israël pour réaliser une étude technique de votre projet.',
              },
              {
                question: 'Proposez-vous des facilités de paiement ?',
                answer: 'Oui, nous proposons plusieurs solutions de financement adaptées à votre situation. Parlons-en !',
              },
            ]}
          />
        </div>
      </section>
    </div>
  )
}

