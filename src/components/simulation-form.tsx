'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const simulationSchema = z.object({
  nomProjet: z.string().optional(),
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
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: initialValues || {
      nomProjet: '',
      consoAnnuelle: 15000,
      partJour: 40,
      surfaceToit: 50,
      prixAchatKwh: defaultPrixAchatKwh,
      prixReventeKwh: defaultPrixReventeKwh,
    },
  })

  const { register, setValue, watch, handleSubmit, formState: { errors } } = form

  const partJour = watch('partJour')
  const consoAnnuelle = watch('consoAnnuelle')
  const surfaceToit = watch('surfaceToit')

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = mode === 'edit' && simulationId
        ? `/api/simulation/commercial/${simulationId}`
        : '/api/simulation/commercial'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la simulation')
      }

      router.push(`/dashboard/simulation/${result.simulationId}`)
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
        {[1, 2, 3].map((s) => (
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
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 rounded ${s < step ? 'bg-energy' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
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
                <Label htmlFor="nomProjet">Nom du projet (optionnel)</Label>
                <Input
                  id="nomProjet"
                  placeholder="Ex: Villa Cohen - Herzliya"
                  {...register('nomProjet')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consoAnnuelle">
                  Consommation annuelle (kWh/an)
                </Label>
                <Input
                  id="consoAnnuelle"
                  type="number"
                  {...register('consoAnnuelle', { valueAsNumber: true })}
                />
                {errors.consoAnnuelle && (
                  <p className="text-sm text-destructive">{errors.consoAnnuelle.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Visible sur la facture IEC ou les relevés mensuels
                </p>
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
                onClick={() => setStep(2)}
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
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Surface de toiture disponible</Label>
                  <span className="text-sm font-medium">{surfaceToit} m²</span>
                </div>
                <Slider
                  value={[surfaceToit]}
                  onValueChange={(v) => setValue('surfaceToit', v[0])}
                  min={10}
                  max={500}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 m²</span>
                  <span>500 m²</span>
                </div>
              </div>

              {/* Quick select */}
              <div className="grid grid-cols-4 gap-2">
                {[30, 50, 80, 120].map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={surfaceToit === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('surfaceToit', size)}
                  >
                    {size} m²
                  </Button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
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

