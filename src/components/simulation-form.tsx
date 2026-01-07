'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  Sun, 
  Zap, 
  Home,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Loader2,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactSelector } from '@/components/contact-selector'

const simulationSchema = z.object({
  nomProjet: z.string().min(1, 'Le nom du projet est obligatoire'),
  consoAnnuelle: z.number().min(1000).max(1000000),
  partJour: z.number().min(0).max(100),
  surfaceToit: z.number().min(10).max(10000),
  prixAchatKwh: z.number().min(0.1).max(2),
  prixReventeKwh: z.number().min(0.1).max(2),
})

type FormData = z.infer<typeof simulationSchema>

interface SimulationFormProps {
  defaultPrixAchatKwh: number
  defaultPrixReventeKwh: number
  initialValues?: {
    nomProjet?: string
    consoAnnuelle: number
    partJour: number
    surfaceToit: number
    prixAchatKwh: number
    prixReventeKwh: number
  }
  simulationId?: string
  mode?: 'create' | 'edit'
}

export function SimulationForm({ 
  defaultPrixAchatKwh, 
  defaultPrixReventeKwh,
  initialValues,
  simulationId,
  mode = 'create'
}: SimulationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(mode === 'create' ? 0 : 1) // Étape 0 = Contact (uniquement en mode create)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consoInputMode, setConsoInputMode] = useState<'kwh' | 'shekels'>('kwh')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    mode === 'create' ? (searchParams?.get('contactId') || null) : null
  )
  const TARIF_FIXE = 0.64 // ₪/kWh

  // Si contactId est fourni dans l'URL, passer directement à l'étape 1
  useEffect(() => {
    if (mode === 'create' && selectedContactId && step === 0) {
      setStep(1)
    }
  }, [selectedContactId, mode, step])

  const form = useForm<FormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: initialValues || {
      nomProjet: '',
      consoAnnuelle: 15000,
      partJour: 50,
      surfaceToit: 50,
      prixAchatKwh: defaultPrixAchatKwh,
      prixReventeKwh: defaultPrixReventeKwh,
    },
  })

  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = form
  
  // Réinitialiser le formulaire quand initialValues change (mode edit)
  useEffect(() => {
    if (initialValues && mode === 'edit') {
      reset({
        nomProjet: initialValues.nomProjet || '',
        consoAnnuelle: initialValues.consoAnnuelle,
        partJour: initialValues.partJour,
        surfaceToit: initialValues.surfaceToit,
        prixAchatKwh: initialValues.prixAchatKwh,
        prixReventeKwh: initialValues.prixReventeKwh,
      })
    }
  }, [initialValues, mode, reset])

  const partJour = watch('partJour')
  const consoAnnuelle = watch('consoAnnuelle')
  const surfaceToit = watch('surfaceToit')
  
  // Calcul de la conversion pour l'affichage
  const consoKwh = consoInputMode === 'kwh' 
    ? consoAnnuelle 
    : (consoAnnuelle / TARIF_FIXE)
  
  const consoShekels = consoInputMode === 'kwh'
    ? (consoAnnuelle * TARIF_FIXE)
    : consoAnnuelle
  
  // Mettre à jour la valeur dans le formulaire quand on change de mode
  const handleConsoModeChange = (mode: 'kwh' | 'shekels') => {
    const currentValue = consoAnnuelle || 0
    if (currentValue > 0) {
      const newValue = mode === 'shekels'
        ? Math.round(currentValue * TARIF_FIXE)
        : Math.round(currentValue / TARIF_FIXE)
      setValue('consoAnnuelle', newValue)
    }
    setConsoInputMode(mode)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    // Convertir en kWh si nécessaire
    const consoKwh = consoInputMode === 'kwh' 
      ? data.consoAnnuelle 
      : data.consoAnnuelle / TARIF_FIXE

    try {
      const dataToSend = {
        ...data,
        consoAnnuelle: Math.round(consoKwh),
        contactId: mode === 'create' ? selectedContactId : undefined,
      }
      const url = mode === 'edit' && simulationId
        ? `/api/simulation/commercial/${simulationId}`
        : '/api/simulation/commercial'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la simulation')
      }

      // Forcer un rechargement complet avec window.location.href
      // Cela garantit que les données sont rechargées depuis le serveur
      window.location.href = `/dashboard/simulation/${result.simulationId}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pt-16 lg:pt-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {mode === 'edit' ? 'Modifier la simulation' : 'Nouvelle simulation'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {mode === 'edit' 
            ? 'Modifiez les paramètres de la simulation' 
            : 'Créez une simulation photovoltaïque pour votre client'
          }
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(() => {
          const steps = mode === 'create' ? [0, 1, 2, 3] : [1, 2, 3]
          return steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                      ? 'bg-energy text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {s === 0 ? <User className="w-4 h-4" /> : s}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 rounded ${s < step ? 'bg-energy' : 'bg-muted'}`} />
              )}
            </div>
          ))
        })()}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Contact (uniquement en mode create) */}
        {step === 0 && mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-solar" />
                Contact client
              </CardTitle>
              <CardDescription>
                Sélectionnez un contact existant ou créez-en un nouveau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactSelector
                selectedContactId={selectedContactId}
                onContactSelect={(contactId) => {
                  setSelectedContactId(contactId)
                  if (contactId) {
                    setStep(1)
                  }
                }}
                onContactCreate={async (contact) => {
                  const response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contact),
                  })
                  const data = await response.json()
                  if (!response.ok) {
                    throw new Error(data.error || 'Erreur création contact')
                  }
                  return data.contact.id
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 1: Infos projet */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-solar" />
                Informations du projet
              </CardTitle>
              <CardDescription>
                Nom du projet et consommation électrique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nomProjet">Nom du projet *</Label>
                <Input
                  id="nomProjet"
                  placeholder="Ex: Villa Cohen - Herzliya"
                  {...register('nomProjet')}
                />
                {errors.nomProjet && (
                  <p className="text-sm text-destructive">{errors.nomProjet.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Consommation annuelle</Label>
                
                {/* Sélecteur de mode */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={consoInputMode === 'kwh' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConsoModeChange('kwh')}
                    className="flex-1"
                  >
                    kWh/an
                  </Button>
                  <Button
                    type="button"
                    variant={consoInputMode === 'shekels' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConsoModeChange('shekels')}
                    className="flex-1"
                  >
                    ₪/an
                  </Button>
                </div>
                
                <Input
                  id="consoAnnuelle"
                  type="number"
                  placeholder={consoInputMode === 'kwh' ? "15000" : "9600"}
                  {...register('consoAnnuelle', { 
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseFloat(e.target.value) || 0
                      setValue('consoAnnuelle', value)
                    }
                  })}
                />
                
                {/* Affichage de la conversion */}
                {consoAnnuelle && consoAnnuelle > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {consoInputMode === 'kwh' 
                      ? `${consoAnnuelle.toLocaleString('fr-FR')} kWh/an soit environ ${Math.round(consoShekels).toLocaleString('fr-FR')} ₪/an`
                      : `${Math.round(consoAnnuelle).toLocaleString('fr-FR')} ₪/an soit environ ${Math.round(consoKwh).toLocaleString('fr-FR')} kWh/an`
                    }
                  </p>
                )}
                
                {errors.consoAnnuelle && (
                  <p className="text-sm text-destructive">{errors.consoAnnuelle.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Répartition de la consommation</Label>
                  <span className="text-sm font-medium">{partJour}% jour / {100 - partJour}% nuit</span>
                </div>
                <Slider
                  value={[partJour]}
                  onValueChange={(v) => setValue('partJour', v[0])}
                  max={100}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Plus de nuit</span>
                  <span>Plus de jour</span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full bg-solar-gradient hover:opacity-90 text-white"
                onClick={() => {
                  if (mode === 'create' && step === 0) {
                    // Si on est à l'étape 0, aller à l'étape 1
                    if (selectedContactId) {
                      setStep(1)
                    }
                  } else {
                    setStep(2)
                  }
                }}
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Installation */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-solar" />
                Surface disponible
              </CardTitle>
              <CardDescription>
                Espace disponible pour les panneaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="surfaceToit">Surface de toiture disponible (m²)</Label>
                <Input
                  id="surfaceToit"
                  type="number"
                  min={10}
                  max={10000}
                  placeholder="50"
                  {...register('surfaceToit', { 
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseFloat(e.target.value) || 0
                      setValue('surfaceToit', value)
                    }
                  })}
                />
                {errors.surfaceToit && (
                  <p className="text-sm text-destructive">{errors.surfaceToit.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Surface exploitable pour l&apos;installation des panneaux (minimum 10 m²)
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(mode === 'create' ? 0 : 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-solar-gradient hover:opacity-90 text-white"
                  onClick={() => setStep(3)}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tarifs */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-energy" />
                Tarifs électriques
              </CardTitle>
              <CardDescription>
                Prix d'achat et de revente du kWh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prixAchatKwh">
                  Prix d'achat du kWh (₪)
                </Label>
                <Input
                  id="prixAchatKwh"
                  type="number"
                  step="0.01"
                  {...register('prixAchatKwh', { valueAsNumber: true })}
                />
                {errors.prixAchatKwh && (
                  <p className="text-sm text-destructive">{errors.prixAchatKwh.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prixReventeKwh">
                  Prix de revente du kWh (₪)
                </Label>
                <Input
                  id="prixReventeKwh"
                  type="number"
                  step="0.01"
                  {...register('prixReventeKwh', { valueAsNumber: true })}
                />
                {errors.prixReventeKwh && (
                  <p className="text-sm text-destructive">{errors.prixReventeKwh.message}</p>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-medium mb-3">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consommation</span>
                    <span>{consoAnnuelle?.toLocaleString()} kWh/an</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part journée</span>
                    <span>{partJour}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Surface</span>
                    <span>{surfaceToit} m²</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-solar-gradient hover:opacity-90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      {mode === 'edit' ? 'Enregistrer les modifications' : 'Lancer la simulation'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}

