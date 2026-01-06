'use client'

import Link from 'next/link'
import { Sun, Zap, TrendingUp, Shield, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-solar-gradient flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MZ Energy</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#avantages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Avantages
              </a>
              <a href="#comment-ca-marche" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Comment ça marche
              </a>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Espace Pro
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
                <Zap className="w-4 h-4" />
                Simulation gratuite en 2 minutes
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Passez au solaire
                <span className="block text-amber-500">
                  et économisez gros
                </span>
          </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Découvrez combien vous pouvez économiser chaque année avec une installation 
                photovoltaïque adaptée à votre consommation en Israël.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/simulation">
                  <Button size="lg" className="bg-solar-gradient hover:opacity-90 transition-opacity text-white w-full sm:w-auto group">
                    Simuler mes économies
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#comment-ca-marche">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    En savoir plus
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">1 800h</div>
                  <div className="text-sm text-muted-foreground">d&apos;ensoleillement/an</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">20 ans</div>
                  <div className="text-sm text-muted-foreground">de garantie</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">14 000</div>
                  <div className="text-sm text-muted-foreground">kWh revendables/an</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-solar-gradient opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-card rounded-3xl p-8 shadow-2xl border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Économies potentielles</span>
                    <span className="px-3 py-1 rounded-full bg-energy/10 text-energy text-xs font-semibold">
                      Exemple
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-5xl font-bold tracking-tight">
                      84 414 <span className="text-2xl">₪/an</span>
                    </div>
                    <div className="text-muted-foreground">
                      Pour 120 000 kWh/an de consommation
                    </div>
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="text-sm text-muted-foreground mb-1">Sur 20 ans</div>
                      <div className="text-xl font-bold">1.9M ₪</div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="text-sm text-muted-foreground mb-1">Production</div>
                      <div className="text-xl font-bold">137 808 kWh</div>
                    </div>
                  </div>
                  
                  <Link href="/simulation" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Calculer pour ma situation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll indicator */}
      <div className="flex justify-center pb-8">
        <a href="#avantages" className="animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </a>
      </div>

      {/* Avantages Section */}
      <section id="avantages" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi passer au solaire ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              L&apos;énergie solaire en Israël offre des avantages considérables grâce 
              à l&apos;ensoleillement exceptionnel du pays.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Économies durables',
                description: 'Réduisez votre facture d\'électricité jusqu\'à 100% et revendez votre surplus.',
                color: 'bg-solar-gradient',
              },
              {
                icon: Sun,
                title: '1 800h de soleil',
                description: 'Israël bénéficie d\'un des meilleurs ensoleillements au monde.',
                color: 'bg-energy-gradient',
              },
              {
                icon: Shield,
                title: 'Garantie 20 ans',
                description: 'Des équipements de qualité avec une garantie de performance sur 20 ans.',
                color: 'bg-solar-gradient',
              },
              {
                icon: Zap,
                title: 'Revente au réseau',
                description: 'Jusqu\'à 14 000 kWh/an revendables au réseau électrique.',
                color: 'bg-energy-gradient',
              },
            ].map((item, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche Section */}
      <section id="comment-ca-marche" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En quelques étapes simples, découvrez votre potentiel d&apos;économies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Renseignez vos infos',
                description: 'Indiquez votre consommation annuelle et la surface de votre toit disponible.',
              },
              {
                step: '02',
                title: 'Simulation instantanée',
                description: 'Notre algorithme calcule 4 scénarios adaptés à votre situation.',
              },
              {
                step: '03',
                title: 'Un expert vous rappelle',
                description: 'Un conseiller vous contacte sous 24h pour affiner votre projet.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-muted/30 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/simulation">
              <Button size="lg" className="bg-solar-gradient hover:opacity-90 transition-opacity text-white group">
                Commencer ma simulation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">MZ Energy</span>
            </div>
            
            <div className="text-sm text-primary-foreground/70">
              © 2026 MZ Energy. Tous droits réservés. | mz-energy.co.il
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm hover:underline">
                Espace Pro
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
