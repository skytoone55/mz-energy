'use client'

import Link from 'next/link'
import { Sun, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { T } from '@/components/T'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Colonne 1 - Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">MZ Energy</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              <T>L&apos;énergie solaire, simplement.</T>
            </p>
            <p className="text-sm text-primary-foreground/70">
              <T>Votre partenaire pour la transition énergétique en Israël.</T>
            </p>
          </div>

          {/* Colonne 2 - Solutions */}
          <div>
            <h3 className="font-semibold mb-4"><T>Solutions</T></h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/particuliers" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Particuliers</T>
                </Link>
              </li>
              <li>
                <Link href="/professionnels" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Professionnels</T>
                </Link>
              </li>
              <li>
                <Link href="/professionnels/entreprises" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Entreprises</T>
                </Link>
              </li>
              <li>
                <Link href="/professionnels/investisseurs" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Investisseurs</T>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Entreprise */}
          <div>
            <h3 className="font-semibold mb-4"><T>Entreprise</T></h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-propos" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>À propos</T>
                </Link>
              </li>
              <li>
                <Link href="/a-propos/carrieres" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Carrières</T>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Contact</T>
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Connexion</T>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h3 className="font-semibold mb-4"><T>Contact</T></h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">[Adresse à définir]</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-primary-foreground/80">+972 XX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contact@mz-energy.co.il" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  contact@mz-energy.co.il
                </a>
              </li>
              <li className="flex items-start gap-2 pt-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-primary-foreground/80">
                  <div><T>Dim - Jeu : 9h00 - 18h00</T></div>
                </div>
              </li>
            </ul>
          </div>

          {/* Colonne 5 - Légal */}
          <div>
            <h3 className="font-semibold mb-4"><T>Informations légales</T></h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Mentions légales</T>
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <T>Politique de confidentialité</T>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-primary-foreground/70">
            <T>© 2025 MZ Energy. Tous droits réservés.</T>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <span>🌐</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

