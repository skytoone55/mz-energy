'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  Sun, Battery, BarChart3, Coins, 
  Home, Building2, Globe, Ship, Handshake, 
  ShieldCheck, Wrench, Smartphone, TrendingUp, Zap, FileCheck,
  Calculator, ClipboardCheck, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { PartnersSection } from '@/components/sections/PartnersSection'
import { T } from '@/components/T'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="L'énergie solaire, simplement."
        subtitle="Produisez votre électricité. Stockez-la. Revendez le surplus. Solutions photovoltaïques clé en main en Israël."
        primaryCTA={{
          text: 'Simuler mes économies',
          href: '/simulation',
        }}
        secondaryCTA={{
          text: 'Être rappelé',
          action: 'callback',
        }}
        secondaryVariant="green"
        backgroundImage="/images/home/home_01_hero.jpg"
        showScrollIndicator={true}
      />

      {/* Section 2 - Les 4 Piliers */}
      <section id="content" className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Un écosystème solaire complet</T>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <T>Tout ce qu&apos;il faut pour maîtriser votre énergie</T>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sun,
                title: 'Produire',
                description: 'Vos panneaux captent l\'énergie du soleil et alimentent directement votre logement. Vous réduisez immédiatement votre facture d\'électricité.',
              },
              {
                icon: Battery,
                title: 'Stocker',
                description: 'Les batteries conservent le surplus produit en journée. Vous consommez votre propre énergie même après le coucher du soleil.',
              },
              {
                icon: BarChart3,
                title: 'Piloter',
                description: 'Suivez en temps réel votre production, consommation et économies depuis votre smartphone. Gardez le contrôle total sur votre installation.',
              },
              {
                icon: Coins,
                title: 'Revendre',
                description: 'Injectez votre surplus dans le réseau et générez des revenus passifs. Votre toit devient un investissement rentable.',
                badge: 'Option',
              },
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        <T>{item.badge}</T>
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold"><T>{item.title}</T></h3>
                  <p className="text-sm text-muted-foreground"><T>{item.description}</T></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Monitoring */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              <div className="relative rounded-xl overflow-hidden border shadow-lg max-w-xs w-full">
                <div className="aspect-[2/3] relative">
                  <Image
                    src="/images/home/home_02_monitoring_app.jpg"
                    alt="Application de monitoring MZ Energy"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                <T>Votre installation dans votre poche</T>
              </h2>
              <p className="text-lg text-muted-foreground">
                <T>L&apos;application MZ Energy vous offre une visibilité complète sur votre système solaire</T>
              </p>
              <ul className="space-y-3">
                {[
                  'Production solaire en temps réel',
                  'Consommation instantanée',
                  'État de charge des batteries',
                  'Historique et statistiques',
                  'Alertes et notifications',
                  'Support technique à distance',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span><T>{item}</T></span>
                  </li>
                ))}
              </ul>
              <blockquote className="pl-4 border-l-4 border-solar text-lg italic text-muted-foreground">
                <T>&quot;Vous savez exactement ce que vous produisez, ce que vous consommez, et ce que vous économisez.&quot;</T>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Pourquoi le solaire en Israël */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Pourquoi passer au solaire en Israël ?</T>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <T>Des conditions idéales pour un investissement énergétique intelligent</T>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[
              {
                icon: Sun,
                chiffre: '1 800+',
                texte: 'Heures d\'ensoleillement par an',
              },
              {
                icon: TrendingUp,
                chiffre: '↗️',
                texte: 'Coût de l\'électricité en hausse constante',
              },
              {
                icon: Zap,
                chiffre: '⚠️',
                texte: 'Réseau électrique sous tension',
              },
              {
                icon: Home,
                chiffre: '🔒',
                texte: 'Demande croissante d\'autonomie énergétique',
              },
              {
                icon: FileCheck,
                chiffre: '✓',
                texte: 'Réglementation favorable à la revente',
              },
            ].map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center mx-auto">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{item.chiffre}</div>
                  <p className="text-sm text-muted-foreground"><T>{item.texte}</T></p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">
              <T>Le solaire n&apos;est plus une option, c&apos;est un investissement stratégique.</T>
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 - Nos Solutions */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Des solutions adaptées à vos besoins</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Particuliers */}
            <Card className="group hover:shadow-xl transition-all overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/home/home_03_particuliers.jpg"
                  alt="Particuliers"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-solar-gradient flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold"><T>Particuliers</T></h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <T>Réduisez votre facture d&apos;électricité</T></li>
                  <li>• <T>Gagnez en indépendance énergétique</T></li>
                  <li>• <T>Protégez-vous des coupures de courant</T></li>
                  <li>• <T>Générez des revenus passifs</T></li>
                </ul>
                <Link href="/particuliers">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <T>Découvrir nos solutions</T>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card Professionnels */}
            <Card className="group hover:shadow-xl transition-all overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/home/home_04_professionnels.jpg"
                  alt="Professionnels"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-energy-gradient flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold"><T>Professionnels</T></h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <T>Réduisez vos charges d&apos;exploitation</T></li>
                  <li>• <T>Sécurisez vos coûts énergétiques</T></li>
                  <li>• <T>Valorisez vos surfaces de toiture</T></li>
                  <li>• <T>Bénéficiez d&apos;avantages fiscaux</T></li>
                </ul>
                <Link href="/professionnels">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <T>Découvrir nos solutions</T>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 6 - Pourquoi MZ Energy */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Pourquoi choisir MZ Energy ?</T>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <T>Expérience, qualité et accompagnement local</T>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Expertise européenne',
                texte: 'Expérience éprouvée dans l\'industrie photovoltaïque',
              },
              {
                icon: Ship,
                title: 'Importateur direct',
                texte: 'Réseau établi en Asie pour des équipements de qualité',
              },
              {
                icon: Handshake,
                title: 'Partenariats exclusifs',
                texte: 'Distributeur officiel MAZDA et DEYE en Israël',
              },
              {
                icon: ShieldCheck,
                title: 'Garanties solides',
                texte: 'Couverture long terme sur tous les équipements',
              },
              {
                icon: Wrench,
                title: 'Installation et SAV local',
                texte: 'Service et maintenance sur place en Israël',
              },
              {
                icon: Smartphone,
                title: 'Monitoring inclus',
                texte: 'Suivi en temps réel de chaque installation',
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold"><T>{item.title}</T></h3>
                  <p className="text-sm text-muted-foreground"><T>{item.texte}</T></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 - Nos Partenaires */}
      <PartnersSection backgroundImage="/images/home/home_05_background_partenaires.jpg" />

      {/* Section 8 - CTA Final */}
      <CTASection
        title="Prêt à passer au solaire ?"
        text="Simulez vos économies en 2 minutes ou demandez à être rappelé par notre équipe."
        primaryCTA={{
          text: 'Lancer ma simulation',
          href: '/simulation',
        }}
        secondaryCTA={{
          text: 'Être rappelé',
          action: 'callback',
        }}
        secondaryVariant="green"
        backgroundImage="/images/home/home_06_cta_sunset.jpg"
      />
    </div>
  )
}
