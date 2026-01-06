'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sun, ArrowLeft, ArrowRight, User, Zap, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { leadSchema, simulationSchema, type LeadFormValues, type SimulationFormValues } from '@/lib/validations'

type FormStep = 'lead' | 'simulation'

export default function SimulationPage() {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>('lead')
  const [leadData, setLeadData] = useState<LeadFormValues | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form pour étape 1 (Lead)
  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      ville: '',
    },
  })

  // Form pour étape 2 (Simulation)
  const simulationForm = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      consoAnnuelle: 12000,
      partJour: 50,
      surfaceToit: 50,
      prixAchatKwh: 0.64,
      prixReventeKwh: 0.54,
    },
  })

  const handleLeadSubmit = (data: LeadFormValues) => {
    setLeadData(data)
    setStep('simulation')
  }

  const handleSimulationSubmit = async (data: SimulationFormValues) => {
    if (!leadData) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, ...data }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la simulation')
      }
      
      const result = await response.json()
      
      // Stocker les résultats dans sessionStorage et rediriger
      sessionStorage.setItem('simulationResult', JSON.stringify(result))
      sessionStorage.setItem('leadData', JSON.stringify(leadData))
      router.push('/simulation/resultat')
      
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-solar-gradient flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MZ Energy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Link 
            href={step === 'lead' ? '/' : '#'}
            onClick={(e) => {
              if (step === 'simulation') {
                e.preventDefault()
                setStep('lead')
              }
            }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'lead' ? 'Retour à l\'accueil' : 'Étape précédente'}
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === 'lead' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'lead' ? 'bg-solar-gradient text-white' : 'bg-energy text-white'
              }`}>
                {step === 'simulation' ? '✓' : '1'}
              </div>
              <span className="font-medium">Vos coordonnées</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div className={`h-full bg-solar-gradient transition-all duration-500 ${
                step === 'simulation' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 'simulation' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'simulation' ? 'bg-solar-gradient text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className="font-medium">Votre consommation</span>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl">
            {step === 'lead' ? (
              <>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Vos coordonnées</CardTitle>
                  <CardDescription>
                    Pour vous envoyer votre simulation personnalisée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={leadForm.handleSubmit(handleLeadSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom *</Label>
                        <Input
                          id="prenom"
                          placeholder="Jean"
                          {...leadForm.register('prenom')}
                        />
                        {leadForm.formState.errors.prenom && (
                          <p className="text-sm text-destructive">{leadForm.formState.errors.prenom.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                          id="nom"
                          placeholder="Dupont"
                          {...leadForm.register('nom')}
                        />
                        {leadForm.formState.errors.nom && (
                          <p className="text-sm text-destructive">{leadForm.formState.errors.nom.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean.dupont@email.com"
                        {...leadForm.register('email')}
                      />
                      {leadForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{leadForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          type="tel"
                          placeholder="+972..."
                          {...leadForm.register('telephone')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ville">Ville</Label>
                        <Input
                          id="ville"
                          placeholder="Tel Aviv"
                          {...leadForm.register('ville')}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-solar-gradient hover:opacity-90 text-white group">
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Votre consommation</CardTitle>
                  <CardDescription>
                    Ces informations nous permettent de dimensionner votre installation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={simulationForm.handleSubmit(handleSimulationSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="consoAnnuelle">Consommation annuelle (kWh/an) *</Label>
                      <Input
                        id="consoAnnuelle"
                        type="number"
                        placeholder="12000"
                        {...simulationForm.register('consoAnnuelle', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Vous trouverez cette info sur votre facture d&apos;électricité annuelle
                      </p>
                      {simulationForm.formState.errors.consoAnnuelle && (
                        <p className="text-sm text-destructive">{simulationForm.formState.errors.consoAnnuelle.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partJour">Part de consommation en journée (%) *</Label>
                      <Input
                        id="partJour"
                        type="number"
                        min="10"
                        max="90"
                        placeholder="50"
                        {...simulationForm.register('partJour', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Estimation de la part consommée entre 8h et 18h (généralement 40-60%)
                      </p>
                      {simulationForm.formState.errors.partJour && (
                        <p className="text-sm text-destructive">{simulationForm.formState.errors.partJour.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surfaceToit">Surface de toit disponible (m²) *</Label>
                      <Input
                        id="surfaceToit"
                        type="number"
                        placeholder="50"
                        {...simulationForm.register('surfaceToit', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Surface exploitable pour l&apos;installation des panneaux
                      </p>
                      {simulationForm.formState.errors.surfaceToit && (
                        <p className="text-sm text-destructive">{simulationForm.formState.errors.surfaceToit.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prixAchatKwh">Prix achat (₪/kWh)</Label>
                        <Input
                          id="prixAchatKwh"
                          type="number"
                          step="0.01"
                          placeholder="0.64"
                          {...simulationForm.register('prixAchatKwh', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prixReventeKwh">Prix revente (₪/kWh)</Label>
                        <Input
                          id="prixReventeKwh"
                          type="number"
                          step="0.01"
                          placeholder="0.54"
                          {...simulationForm.register('prixReventeKwh', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-solar-gradient hover:opacity-90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Calcul en cours...
                        </>
                      ) : (
                        <>
                          Voir mes résultats
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span>Simulation gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Résultat instantané</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

