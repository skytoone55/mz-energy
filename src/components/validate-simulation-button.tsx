'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ValidateSimulationButtonProps {
  simulationId: string
  currentStatus: 'en_cours' | 'validee'
  validatedAt?: string
  canValidate: boolean
  onValidated?: () => void
}

export function ValidateSimulationButton({
  simulationId,
  currentStatus,
  validatedAt,
  canValidate,
  onValidated,
}: ValidateSimulationButtonProps) {
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canValidate) {
    return null
  }

  if (currentStatus === 'validee') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-700">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">
          Validée
          {validatedAt && (
            <span className="ml-2 text-xs opacity-70">
              le {new Date(validatedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </span>
      </div>
    )
  }

  const handleValidate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir valider cette simulation ? Elle sera marquée comme "Client signé".')) {
      return
    }

    setValidating(true)
    setError(null)

    try {
      const response = await fetch(`/api/simulation/${simulationId}/validate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la validation')
      }

      if (onValidated) {
        onValidated()
      } else {
        // Recharger la page pour afficher le nouveau statut
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleValidate}
        disabled={validating}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {validating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validation...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Valider cette simulation
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}
