'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [professionnelsOpen, setProfessionnelsOpen] = useState(false)
  const [aproposOpen, setAproposOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-solar-gradient flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">MZ Energy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Accueil
            </Link>
            <Link
              href="/particuliers"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/particuliers') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Particuliers
            </Link>

            {/* Professionnels Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setProfessionnelsOpen(true)}
              onMouseLeave={() => setProfessionnelsOpen(false)}
            >
              <button
                className={cn(
                  'text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer',
                  pathname.startsWith('/professionnels') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Professionnels
                <ChevronDown className="w-4 h-4" />
              </button>
              {professionnelsOpen && (
                <>
                  {/* Pont invisible pour éviter la fermeture lors du passage de la souris */}
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/professionnels/entreprises"
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => setProfessionnelsOpen(false)}
                    >
                      Entreprises
                    </Link>
                    <Link
                      href="/professionnels/investisseurs"
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => setProfessionnelsOpen(false)}
                    >
                      Investisseurs
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* À propos Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setAproposOpen(true)}
              onMouseLeave={() => setAproposOpen(false)}
            >
              <button
                className={cn(
                  'text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer',
                  pathname.startsWith('/a-propos') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                À propos
                <ChevronDown className="w-4 h-4" />
              </button>
              {aproposOpen && (
                <>
                  {/* Pont invisible pour éviter la fermeture lors du passage de la souris */}
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/a-propos"
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => setAproposOpen(false)}
                    >
                      Notre histoire
                    </Link>
                    <Link
                      href="/a-propos/carrieres"
                      className="block px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => setAproposOpen(false)}
                    >
                      Carrières
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/contact"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/contact') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Contact
            </Link>

            <Link href="/login">
              <Button size="default" className="bg-green-600 hover:bg-green-700 text-white px-6">
                Connexion
              </Button>
            </Link>

            <Link href="/simulation">
              <Button size="default" className="bg-solar-gradient hover:opacity-90 text-white px-6">
                Simuler
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/particuliers"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Particuliers
            </Link>
            <div className="px-3 py-2">
              <div className="font-medium mb-2">Professionnels</div>
              <div className="pl-4 space-y-1">
                <Link
                  href="/professionnels/entreprises"
                  className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entreprises
                </Link>
                <Link
                  href="/professionnels/investisseurs"
                  className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Investisseurs
                </Link>
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="font-medium mb-2">À propos</div>
              <div className="pl-4 space-y-1">
                <Link
                  href="/a-propos"
                  className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notre histoire
                </Link>
                <Link
                  href="/a-propos/carrieres"
                  className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Carrières
                </Link>
              </div>
            </div>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-2">
                Connexion
              </Button>
            </Link>
            <Link href="/simulation" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-solar-gradient hover:opacity-90 text-white mt-2">
                Simuler
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

