'use client'

import { useState } from 'react'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditableSimulationNameProps {
  simulationId: string
  currentName: string | null
  onNameChange?: (newName: string) => void
  canEdit?: boolean
}

export function EditableSimulationName({ 
  simulationId, 
  currentName, 
  onNameChange,
  canEdit = true 
}: EditableSimulationNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!canEdit) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/simulation/${simulationId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomProjet: name || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour')
      }

      setIsEditing(false)
      if (onNameChange) {
        onNameChange(name)
      }
      // Forcer le rechargement pour afficher le nouveau nom
      window.location.reload()
    } catch (error) {
      console.error('Erreur mise à jour nom:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du nom. Veuillez réessayer.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(currentName || '')
    setIsEditing(false)
  }

  if (!canEdit) {
    return (
      <h1 className="text-2xl font-bold">
        {currentName || `Simulation #${simulationId.slice(0, 8)}`}
      </h1>
    )
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet"
          className="text-2xl font-bold h-auto py-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            } else if (e.key === 'Escape') {
              handleCancel()
            }
          }}
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 w-8"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-green-600" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-8 w-8"
        >
          <X className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-2xl font-bold">
        {currentName || `Simulation #${simulationId.slice(0, 8)}`}
      </h1>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Modifier le nom"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

