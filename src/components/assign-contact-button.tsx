'use client'

import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactSelector } from '@/components/contact-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface AssignContactButtonProps {
  simulationId: string
  onContactAssigned?: () => void
}

export function AssignContactButton({ simulationId, onContactAssigned }: AssignContactButtonProps) {
  const [open, setOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)

  const handleAssign = async (contactId: string) => {
    setAssigning(true)
    try {
      const response = await fetch(`/api/simulation/${simulationId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'attribution')
      }

      setOpen(false)
      setSelectedContactId(null)
      if (onContactAssigned) {
        onContactAssigned()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur attribution contact:', error)
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Attribuer à un contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attribuer cette simulation à un contact</DialogTitle>
          <DialogDescription>
            Sélectionnez un contact existant ou créez-en un nouveau
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ContactSelector
            selectedContactId={selectedContactId}
            onContactSelect={(contactId) => {
              setSelectedContactId(contactId)
              if (contactId) {
                handleAssign(contactId)
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
              const newContactId = data.contact.id
              await handleAssign(newContactId)
              return newContactId
            }}
          />
          {assigning && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Attribution en cours...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
