'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Building2, TrendingUp, Award, Clock, FileText, Headphones, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { T } from '@/components/T'

export default function ProfessionnelsPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="Solutions solaires pour professionnels"
        subtitle="Réduisez vos charges, valorisez vos actifs immobiliers et engagez votre entreprise dans la transition énergétique."
        primaryCTA={{
          text: '📞 Demander un devis',
          href: '#',
        }}
        secondaryCTA={{
          text: '🧮 Simuler mon projet',
          href: '/simulation',
          action: 'link',
        }}
        backgroundImage="/images/professionnels/professionnels_01_hero.jpg"
      />

      {/* Section 2 - Deux profils */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Quel est votre projet ?</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Entreprises */}
            <Card className="group hover:shadow-xl transition-all overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/professionnels/professionnels_02_expertise_technique.jpg"
                  alt="Entreprises"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-solar-gradient flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold"><T>Je veux équiper mes locaux</T></h3>
                </div>
                <p className="text-muted-foreground">
                  <T>Vous êtes propriétaire ou locataire de locaux professionnels ? Installez des panneaux solaires pour réduire vos charges d&apos;exploitation et valoriser votre engagement environnemental.</T>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><T>• Bureaux, commerces, entrepôts</T></li>
                  <li><T>• Réduction des charges fixes</T></li>
                  <li><T>• Image de marque responsable</T></li>
                  <li><T>• Avantages fiscaux</T></li>
                </ul>
                <Link href="/professionnels/entreprises">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <T>Solutions Entreprises</T>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card Investisseurs */}
            <Card className="group hover:shadow-xl transition-all overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/professionnels/professionnels_03_investisseurs.jpg"
                  alt="Investisseurs"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-energy-gradient flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold"><T>Je veux investir dans le solaire</T></h3>
                </div>
                <p className="text-muted-foreground">
                  <T>Vous disposez de surfaces de toiture ou de terrain ? Transformez vos actifs en source de revenus récurrents grâce à l&apos;énergie solaire.</T>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><T>• Location de toiture</T></li>
                  <li><T>• Fermes solaires</T></li>
                  <li><T>• Rendement stable 8-12%</T></li>
                  <li><T>• Revenus sur 25 ans</T></li>
                </ul>
                <Link href="/professionnels/investisseurs">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <T>Solutions Investisseurs</T>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3 - Nos atouts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Pourquoi choisir MZ Energy pour votre projet professionnel ?</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: 'Expertise certifiée',
                texte: 'Plus de 500 installations professionnelles réalisées en Israël',
              },
              {
                icon: Clock,
                title: 'Réactivité',
                texte: 'Étude de faisabilité sous 48h, installation dans les meilleurs délais',
              },
              {
                icon: FileText,
                title: 'Accompagnement complet',
                texte: 'De l\'étude à la maintenance, un interlocuteur unique',
              },
              {
                icon: Headphones,
                title: 'Support dédié',
                texte: 'Hotline professionnelle et intervention sous 24h',
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

      {/* Section 4 - CTA Final */}
      <CTASection
        title="Discutons de votre projet"
        text="Chaque projet est unique. Contactez-nous pour une étude personnalisée gratuite."
        primaryCTA={{
          text: '📞 Être rappelé',
          href: '#',
        }}
        secondaryCTA={{
          text: '✉️ Nous contacter',
          href: '/contact',
          action: 'link',
        }}
      />
    </div>
  )
}
