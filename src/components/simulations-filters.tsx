'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Commercial {
  id: string
  prenom: string
  nom: string
  email: string
}

interface SimulationsFiltersProps {
  commercials: Commercial[]
  isAdmin: boolean
  onFiltersChange: (filters: { commercialId: string | null; search: string }) => void
}

export function SimulationsFilters({ commercials, isAdmin, onFiltersChange }: SimulationsFiltersProps) {
  const [selectedCommercial, setSelectedCommercial] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Notifier les changements de filtres
  useEffect(() => {
    const filters = {
      commercialId: selectedCommercial === 'all' ? null : selectedCommercial === 'unassigned' ? 'unassigned' : selectedCommercial,
      search: debouncedSearch,
    }
    onFiltersChange(filters)
  }, [selectedCommercial, debouncedSearch, onFiltersChange])

  const clearFilters = useCallback(() => {
    setSelectedCommercial('all')
    setSearchQuery('')
    setDebouncedSearch('')
  }, [])

  if (!isAdmin) {
    // Pour les commerciaux, afficher uniquement la recherche
    return (
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, projet, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Filtre par commercial */}
      <div className="w-full sm:w-[250px]">
        <Select value={selectedCommercial} onValueChange={setSelectedCommercial}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par commercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les commerciaux</SelectItem>
            <SelectItem value="unassigned">Non assignés</SelectItem>
            {commercials.map((commercial) => (
              <SelectItem key={commercial.id} value={commercial.id}>
                {commercial.prenom} {commercial.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recherche globale */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, projet, email, téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Bouton réinitialiser */}
      {(selectedCommercial !== 'all' || searchQuery) && (
        <Button variant="outline" onClick={clearFilters} className="shrink-0">
          Réinitialiser
        </Button>
      )}
    </div>
  )
}

