'use client'

import { useEffect, useMemo, useState } from 'react'
import { 
  Shield, 
  UserPlus,
  Mail,
  MoreVertical,
  Check,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/components/T'

interface UserProfile {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string | null
  role: 'commercial' | 'admin'
  actif: boolean
  created_at: string
  societe?: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'commercial' as 'commercial' | 'admin',
    societe: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement')
      }
      
      if (result.users) {
        setUsers(result.users)
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setError('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  function openEditDialog(user: UserProfile) {
    setEditingUser(user)
    setNewUser({
      email: user.email,
      password: '',
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      societe: user.societe || '',
    })
    setDialogOpen(true)
  }

  function openCreateDialog() {
    setEditingUser(null)
    setNewUser({
      email: '',
      password: '',
      prenom: '',
      nom: '',
      role: 'commercial',
      societe: '',
    })
    setDialogOpen(true)
  }

  async function saveUser() {
    setCreating(true)
    setError(null)

    try {
      if (editingUser) {
        // Mise à jour
        const response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            prenom: newUser.prenom,
            nom: newUser.nom,
            role: newUser.role,
            actif: editingUser.actif,
            societe: newUser.societe || null,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la mise à jour')
        }
      } else {
        // Création
        if (!newUser.password) {
          throw new Error('Le mot de passe est requis pour créer un utilisateur')
        }
        
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la création')
        }
      }

      await loadUsers()
      setDialogOpen(false)
      setEditingUser(null)
      setNewUser({
        email: '',
        password: '',
        prenom: '',
        nom: '',
        role: 'commercial',
        societe: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setCreating(false)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          actif: !currentStatus,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      await loadUsers()
    } catch (error) {
      console.error('Erreur toggle status:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users

    return users.filter((u) => {
      const haystack = [
        u.prenom,
        u.nom,
        u.email,
        u.telephone ?? '',
        u.societe ?? '',
        u.role,
        u.actif ? 'actif' : 'inactif',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [users, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <T>Gestion des utilisateurs</T>
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredUsers.length} / {users.length} <T>{`utilisateur${users.length > 1 ? 's' : ''} au total`}</T>
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingUser(null)
            setError(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-solar-gradient hover:opacity-90 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              <T>Nouvel utilisateur</T>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? <T>Modifier un utilisateur</T> : <T>Créer un utilisateur</T>}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? <T>Modifiez les informations de l&apos;utilisateur</T>
                  : <T>Ajoutez un nouveau commercial ou administrateur</T>
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom"><T>Prénom</T></Label>
                  <Input
                    id="prenom"
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom"><T>Nom</T></Label>
                  <Input
                    id="nom"
                    value={newUser.nom}
                    onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email"><T>Email</T></Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password"><T>Mot de passe</T></Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label><T>Rôle</T></Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v as 'commercial' | 'admin' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial"><T>Commercial</T></SelectItem>
                    <SelectItem value="admin"><T>Administrateur</T></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="societe"><T>Société (Régie)</T></Label>
                <Input
                  id="societe"
                  value={newUser.societe}
                  onChange={(e) => setNewUser({ ...newUser, societe: e.target.value })}
                  placeholder="Nom de la société (optionnel)"
                />
                <p className="text-xs text-muted-foreground">
                  <T>Indiquez le nom de la société si le commercial travaille pour une régie</T>
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <T>Annuler</T>
              </Button>
              <Button 
                onClick={saveUser} 
                disabled={creating || !newUser.email || (!editingUser && !newUser.password)}
                className="bg-solar-gradient hover:opacity-90 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {editingUser ? <T>Enregistrement...</T> : <T>Création...</T>}
                  </>
                ) : (
                  editingUser ? <T>Enregistrer</T> : <T>Créer</T>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle><T>Liste des utilisateurs</T></CardTitle>
          <CardDescription><T>Commerciaux et administrateurs du système</T></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="users-search"><T>Recherche</T></Label>
            <Input
              id="users-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, prénom, email, téléphone, société..."
              className="mt-2"
            />
          </div>

          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-4 font-medium text-muted-foreground"><T>Utilisateur</T></th>
                    <th className="text-start p-4 font-medium text-muted-foreground"><T>Rôle</T></th>
                    <th className="text-start p-4 font-medium text-muted-foreground"><T>Société</T></th>
                    <th className="text-start p-4 font-medium text-muted-foreground"><T>Statut</T></th>
                    <th className="text-start p-4 font-medium text-muted-foreground"><T>Actions</T></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-secondary/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{user.prenom} {user.nom}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? <T>Administrateur</T> : <T>Commercial</T>}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.societe ? (
                          <span className="text-sm font-medium">{user.societe}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={user.actif ? 'default' : 'destructive'}>
                          {user.actif ? <T>Actif</T> : <T>Inactif</T>}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.actif)}
                            title={user.actif ? 'Désactiver' : 'Activer'}
                          >
                            {user.actif ? (
                              <X className="w-4 h-4 text-destructive" />
                            ) : (
                              <Check className="w-4 h-4 text-energy" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2"><T>Aucun utilisateur</T></h3>
              <p className="text-sm text-muted-foreground">
                <T>Créez votre premier utilisateur</T>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

