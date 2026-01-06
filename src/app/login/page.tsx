'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sun, ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect')
        } else {
          setError(error.message)
        }
        return
      }

      // Redirection vers le dashboard
      router.push('/dashboard')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
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

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          
          <div className="w-16 h-16 rounded-2xl bg-solar-gradient flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl">Espace Professionnel</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre tableau de bord
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link 
                  href="/mot-de-passe-oublie" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-solar-gradient hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas de compte ?{' '}
              <span className="text-foreground">
                Contactez votre administrateur
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

