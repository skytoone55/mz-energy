'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Sun, 
  LayoutDashboard, 
  Calculator, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Package
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  prenom: string
  nom: string
  email: string
  role: 'commercial' | 'admin'
}

interface DashboardNavProps {
  user: UserProfile
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const isAdmin = user.role === 'admin'

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Nouvelle simulation', href: '/dashboard/simulation/nouvelle', icon: Calculator },
    { name: 'Mes simulations', href: '/dashboard/simulations', icon: FolderOpen },
  ]

  const adminNavigation = [
    { name: 'Tous les leads', href: '/admin/leads', icon: Users },
    { name: 'Toutes les simulations', href: '/admin/simulations', icon: FolderOpen },
    { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Shield },
    { name: 'Catalogue', href: '/admin/catalogue', icon: Package },
    { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-solar-gradient flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">MZ Energy</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-card p-6 pt-20">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              
              {isAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Administration
                    </p>
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-solar-gradient flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MZ Energy</span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="font-medium">{user.prenom} {user.nom}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className={cn(
              'inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium',
              isAdmin ? 'bg-energy/10 text-energy' : 'bg-solar/10 text-solar-foreground'
            )}>
              {isAdmin ? 'Administrateur' : 'Commercial'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {isAdmin && (
                <li>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Administration
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname.startsWith(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              <li className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

