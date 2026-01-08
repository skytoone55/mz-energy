'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Award, Users, Lightbulb, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroSection } from '@/components/sections/HeroSection'
import { PartnersSection } from '@/components/sections/PartnersSection'
import { CTASection } from '@/components/sections/CTASection'
import { T } from '@/components/T'

export default function AProposPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <T>À propos de MZ Energy</T>
          </h1>
          <p className="text-xl text-muted-foreground">
            <T>Votre partenaire pour la transition énergétique en Israël</T>
          </p>
        </div>
      </section>

      {/* Section 2 - Notre histoire */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            <T>Notre histoire</T>
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <T>MZ Energy est née de la conviction que l&apos;énergie solaire doit être accessible à tous en Israël.</T>
            </p>
            <p>
              <T>Forts d&apos;une expérience européenne dans l&apos;industrie photovoltaïque et d&apos;un réseau établi avec les meilleurs fabricants asiatiques, nous avons créé MZ Energy pour apporter des solutions solaires de qualité professionnelle sur le marché israélien.</T>
            </p>
            <p>
              <T>Aujourd&apos;hui, nous accompagnons particuliers et professionnels dans leur transition énergétique, avec une approche simple : des équipements premium, une installation soignée, et un suivi de qualité.</T>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 - Notre équipe */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/a-propos/a_propos_01_equipe_dirigeante.jpg"
                alt="Équipe dirigeante"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <T>Une équipe passionnée</T>
              </h2>
              <p className="text-muted-foreground mb-8">
                <T>Notre équipe réunit des experts en énergie solaire, des techniciens certifiés et des conseillers dédiés. Unis par la même passion pour les énergies renouvelables, nous mettons notre expertise au service de vos projets.</T>
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { chiffre: '15+', description: 'Années d\'expérience cumulées' },
                  { chiffre: '500+', description: 'Installations réalisées' },
                  { chiffre: '98%', description: 'Clients satisfaits' },
                  { chiffre: '24h', description: 'Délai d\'intervention SAV' },
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{item.chiffre}</div>
                      <div className="text-sm text-muted-foreground"><T>{item.description}</T></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Nos valeurs */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8">
                <T>Nos valeurs</T>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Award,
                    valeur: 'Excellence',
                    description: 'Nous ne faisons aucun compromis sur la qualité des équipements et des installations',
                  },
                  {
                    icon: Users,
                    valeur: 'Proximité',
                    description: 'Un interlocuteur dédié, une équipe locale, un service réactif',
                  },
                  {
                    icon: Lightbulb,
                    valeur: 'Innovation',
                    description: 'Nous sélectionnons les technologies les plus performantes du marché',
                  },
                  {
                    icon: Heart,
                    valeur: 'Engagement',
                    description: 'Nous croyons en l\'énergie solaire comme solution d\'avenir pour Israël',
                  },
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2"><T>{item.valeur}</T></h3>
                        <p className="text-sm text-muted-foreground"><T>{item.description}</T></p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/a-propos/a_propos_02_valeurs_vision.jpg"
                alt="Valeurs et vision"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Nos partenaires */}
      <PartnersSection />

      {/* Section 6 - Rejoignez-nous */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <T>Rejoignez l&apos;aventure MZ Energy</T>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            <T>Nous recrutons des talents passionnés par les énergies renouvelables. Techniciens, commerciaux, ingénieurs : rejoignez une équipe dynamique et participez à la transition énergétique d&apos;Israël.</T>
          </p>
          <Link href="/a-propos/carrieres">
            <Button size="lg" className="bg-solar-gradient hover:opacity-90 text-white">
              <T>Voir nos offres d&apos;emploi</T>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 7 - CTA Final */}
      <CTASection
        title="Prêt à travailler ensemble ?"
        text="Contactez-nous pour discuter de votre projet solaire."
        primaryCTA={{
          text: '📞 Nous contacter',
          href: '/contact',
        }}
        secondaryCTA={{
          text: '🧮 Simuler mon projet',
          href: '/simulation',
          action: 'link',
        }}
      />
    </div>
  )
}
