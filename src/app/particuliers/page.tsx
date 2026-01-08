'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  PiggyBank, ShieldCheck, Zap, Coins, Leaf, TrendingUp,
  Calculator, ClipboardCheck, Wrench, Smartphone, ArrowRight, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { TestimonialCard } from '@/components/sections/TestimonialCard'
import { FAQ } from '@/components/ui/faq'
import { T } from '@/components/T'

export default function ParticuliersPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="Produisez votre propre électricité"
        subtitle="Réduisez votre facture, gagnez en autonomie et protégez-vous des hausses de prix. Une solution solaire sur mesure pour votre maison."
        primaryCTA={{
          text: '🧮 Simuler mes économies',
          href: '/simulation',
        }}
        secondaryCTA={{
          text: '📞 Être rappelé',
          action: 'callback',
        }}
        backgroundImage="/images/particuliers/particuliers_01_hero.jpg"
      />

      {/* Section 2 - Les bénéfices */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Pourquoi installer des panneaux solaires chez vous ?</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: PiggyBank,
                title: 'Économies immédiates',
                texte: 'Réduisez votre facture d\'électricité dès le premier jour. Jusqu\'à 70% d\'économies sur votre consommation.',
              },
              {
                icon: ShieldCheck,
                title: 'Protection contre les hausses',
                texte: 'Le prix de l\'électricité augmente chaque année. Produisez la vôtre et protégez votre budget familial.',
              },
              {
                icon: Zap,
                title: 'Autonomie énergétique',
                texte: 'Ne dépendez plus uniquement du réseau. Avec une batterie, vous avez de l\'électricité même en cas de coupure.',
              },
              {
                icon: Coins,
                title: 'Revenus complémentaires',
                texte: 'Revendez votre surplus au réseau et générez des revenus passifs. Votre toit travaille pour vous.',
              },
              {
                icon: Leaf,
                title: 'Geste écologique',
                texte: 'Participez à la transition énergétique. L\'énergie solaire est propre, renouvelable et disponible en abondance en Israël.',
              },
              {
                icon: TrendingUp,
                title: 'Valorisation immobilière',
                texte: 'Une maison équipée de panneaux solaires gagne en valeur sur le marché immobilier.',
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

      {/* Section 3 - Nos solutions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Deux solutions adaptées à vos besoins</T>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Solution On-Grid */}
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/particuliers/particuliers_02_on_grid.jpg"
                  alt="Solution On-Grid"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Solution On-Grid</CardTitle>
                  <Badge variant="secondary">Économique</Badge>
                </div>
                <CardDescription><T>L&apos;essentiel pour commencer à économiser</T></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <T>Vos panneaux produisent de l&apos;électricité en journée. Vous consommez directement ce que vous produisez et réduisez votre facture. Le soir, le réseau prend le relais.</T>
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold"><T>Inclus :</T></h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Panneaux solaires premium MAZDA</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Onduleur DEYE haute performance</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Installation complète</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Monitoring en temps réel</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Garantie 25 ans sur les panneaux</T>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2"><T>Idéal pour :</T></h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><T>• Maisons avec consommation principalement en journée</T></li>
                    <li><T>• Budget maîtrisé</T></li>
                    <li><T>• Première installation solaire</T></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Solution Hybride */}
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/particuliers/particuliers_03_hybride_batterie.jpg"
                  alt="Solution Hybride"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle><T>Solution Hybride</T></CardTitle>
                  <Badge className="bg-energy text-white"><T>Autonomie maximale</T></Badge>
                </div>
                <CardDescription><T>L&apos;indépendance énergétique complète</T></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <T>Vos panneaux alimentent votre maison en journée. Le surplus est stocké dans votre batterie pour le soir et la nuit. Vous êtes autonome 24h/24, même en cas de coupure réseau.</T>
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold"><T>Inclus :</T></h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Panneaux solaires premium MAZDA</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Onduleur hybride DEYE</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Batterie de stockage MAZDA</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Installation complète</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Monitoring avancé</T>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <T>Garantie 25 ans panneaux + 10 ans batterie</T>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2"><T>Idéal pour :</T></h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><T>• Maisons avec consommation jour et soir</T></li>
                    <li><T>• Recherche d&apos;autonomie maximale</T></li>
                    <li><T>• Protection contre les coupures de courant</T></li>
                    <li><T>• Objectif d&apos;autoconsommation totale</T></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4 - Comment ça marche */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Un projet clé en main en 4 étapes</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calculator,
                step: '1',
                title: 'Simulation',
                description: 'Simulez vos économies en ligne en 2 minutes. Recevez une estimation personnalisée.',
              },
              {
                icon: ClipboardCheck,
                step: '2',
                title: 'Étude technique',
                description: 'Notre expert se déplace chez vous pour une étude complète de votre toiture et de vos besoins.',
              },
              {
                icon: Wrench,
                step: '3',
                title: 'Installation',
                description: 'Notre équipe installe votre système en 1 à 2 jours. Propre, rapide, professionnel.',
              },
              {
                icon: Smartphone,
                step: '4',
                title: 'Suivi',
                description: 'Suivez votre production et vos économies en temps réel depuis l&apos;application.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-muted/30 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2"><T>{item.title}</T></h3>
                  <p className="text-muted-foreground"><T>{item.description}</T></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Témoignage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <TestimonialCard
            quote="Notre facture d'électricité a été divisée par 3. L'installation s'est faite en une journée et l'équipe était très professionnelle. Je recommande MZ Energy à tous mes voisins."
            author="David R., Netanya"
            details="Installation : 12 panneaux (7.2 kWc) | Économies : 65% sur la facture | Depuis : Janvier 2024"
            image="/images/particuliers/particuliers_04_temoignage.jpg"
          />
        </div>
      </section>

      {/* Section 6 - FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Questions fréquentes</T>
            </h2>
          </div>

          <FAQ
            items={[
              {
                question: 'Combien coûte une installation solaire ?',
                answer: 'Le coût dépend de la taille de votre installation et de vos besoins. Utilisez notre simulateur pour obtenir une estimation personnalisée. En moyenne, l\'investissement est amorti en 5 à 7 ans.',
              },
              {
                question: 'Quelle est la durée de vie des panneaux ?',
                answer: 'Nos panneaux MAZDA sont garantis 25 ans. Leur durée de vie réelle dépasse souvent 30 ans avec une perte de rendement minime (moins de 0.5% par an).',
              },
              {
                question: 'Mon toit est-il adapté ?',
                answer: 'La plupart des toits en Israël sont adaptés au solaire. Lors de l\'étude technique gratuite, notre expert évalue l\'orientation, l\'inclinaison et l\'ombrage de votre toiture.',
              },
              {
                question: 'Que se passe-t-il en cas de coupure de courant ?',
                answer: 'Avec une solution On-Grid, l\'installation s\'arrête par sécurité. Avec une solution Hybride (batterie), vous continuez à être alimenté par votre batterie.',
              },
              {
                question: 'Puis-je revendre mon surplus d\'électricité ?',
                answer: 'Oui ! En Israël, vous pouvez revendre jusqu\'à 14 000 kWh par an au réseau. Notre simulateur calcule automatiquement vos revenus potentiels.',
              },
            ]}
          />
        </div>
      </section>

      {/* Section 7 - CTA Final */}
      <CTASection
        title="Passez au solaire dès maintenant"
        text="Simulez vos économies gratuitement et découvrez combien vous pouvez économiser."
        primaryCTA={{
          text: '🧮 Lancer ma simulation',
          href: '/simulation',
        }}
        secondaryCTA={{
          text: '📞 Être rappelé',
          action: 'callback',
        }}
      />
    </div>
  )
}

