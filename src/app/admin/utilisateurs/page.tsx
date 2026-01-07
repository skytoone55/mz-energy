'use client'

import { useEffect, useState } from 'react'
import { 
  Shield, 
  UserPlus,
  Mail,
  Percent,
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

interface UserProfile {
  id: string
  prenom: string
  nom: string
  email: string
  role: 'commercial' | 'admin'
  marge_commercial: number
  actif: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'commercial' as 'commercial' | 'admin',
    marge_commercial: 5,
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
      marge_commercial: user.marge_commercial * 100,
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
      marge_commercial: 5,
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
            marge_commercial: newUser.marge_commercial,
            actif: editingUser.actif,
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
        marge_commercial: 5,
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
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
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
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Modifiez les informations de l\'utilisateur' 
                  : 'Ajoutez un nouveau commercial ou administrateur'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={newUser.nom}
                    onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(v) => setNewUser({ ...newUser, role: v as 'commercial' | 'admin' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marge">Marge (%)</Label>
                  <Input
                    id="marge"
                    type="number"
                    min="0"
                    max="50"
                    value={newUser.marge_commercial}
                    onChange={(e) => setNewUser({ ...newUser, marge_commercial: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={saveUser} 
                disabled={creating || !newUser.email || (!editingUser && !newUser.password)}
                className="bg-solar-gradient hover:opacity-90 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingUser ? 'Enregistrement...' : 'Création...'}
                  </>
                ) : (
                  editingUser ? 'Enregistrer' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>Commerciaux et administrateurs du système</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-muted-foreground">Utilisateur</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rôle</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Marge</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
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
                          {user.role === 'admin' ? 'Administrateur' : 'Commercial'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          {(user.marge_commercial * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.actif ? 'default' : 'destructive'}>
                          {user.actif ? 'Actif' : 'Inactif'}
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
              <h3 className="font-medium mb-2">Aucun utilisateur</h3>
              <p className="text-sm text-muted-foreground">
                Créez votre premier utilisateur
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

