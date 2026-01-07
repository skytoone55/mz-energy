import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Debug log
  if (error) {
    console.error('Profile fetch error:', error)
  }

  // Si pas de profil, afficher un message au lieu de rediriger (évite boucle infinie)
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
          <p className="text-muted-foreground mb-4">
            Votre compte existe mais votre profil utilisateur n'a pas été créé.
          </p>
          <p className="text-sm text-muted-foreground">
            Contactez l'administrateur pour créer votre profil.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

