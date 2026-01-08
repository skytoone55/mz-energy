'use client'

import Image from 'next/image'
import { 
  PiggyBank, Lock, Leaf, Receipt, Zap, TrendingUp,
  Building, Store, Factory, Hotel, Hospital
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { TestimonialCard } from '@/components/sections/TestimonialCard'
import { T } from '@/components/T'

export default function EntreprisesPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="Équipez vos locaux en énergie solaire"
        subtitle="Bureaux, commerces, entrepôts, usines : réduisez vos charges et engagez votre entreprise dans la transition énergétique."
        primaryCTA={{
          text: '📞 Demander une étude gratuite',
          href: '#',
        }}
        backgroundImage="/images/entreprises/entreprises_02_site_equipe.jpg"
      />

      {/* Section 2 - Bénéfices entreprises */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Les avantages du solaire pour votre entreprise</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: PiggyBank,
                title: 'Réduction des charges',
                texte: 'Diminuez vos coûts d\'électricité de 40% à 70%. Un poste de dépense en moins.',
              },
              {
                icon: Lock,
                title: 'Maîtrise des coûts',
                texte: 'Protégez-vous des hausses tarifaires. Votre coût énergétique devient prévisible sur 25 ans.',
              },
              {
                icon: Leaf,
                title: 'Image responsable',
                texte: 'Affichez votre engagement RSE. Vos clients et partenaires valorisent les entreprises éco-responsables.',
              },
              {
                icon: Receipt,
                title: 'Avantages fiscaux',
                texte: 'Amortissement accéléré, déductions fiscales : optimisez la fiscalité de votre investissement.',
              },
              {
                icon: Zap,
                title: 'Continuité d\'activité',
                texte: 'Avec une solution batterie, maintenez votre activité même en cas de coupure réseau.',
              },
              {
                icon: TrendingUp,
                title: 'Valorisation immobilière',
                texte: 'Vos locaux gagnent en valeur avec une installation solaire intégrée.',
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

      {/* Section 3 - Types de locaux */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Nous équipons tous types de locaux professionnels</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/entreprises/entreprises_02_site_equipe.jpg"
                alt="Site d'entreprise équipé"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              {[
                { icon: Building, type: 'Bureaux', description: 'Consommation climatisation, éclairage, informatique' },
                { icon: Store, type: 'Commerces', description: 'Grande surface de toiture, consommation élevée' },
                { icon: Factory, type: 'Entrepôts & Usines', description: 'Très grandes toitures, fort potentiel de production' },
                { icon: Hotel, type: 'Hôtels & Restaurants', description: 'Consommation continue, image éco-responsable' },
                { icon: Hospital, type: 'Établissements de santé', description: 'Besoin de continuité électrique' },
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-solar-gradient flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold"><T>{item.type}</T></h3>
                      <p className="text-sm text-muted-foreground"><T>{item.description}</T></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Processus */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <T>Un accompagnement de A à Z</T>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Étude de faisabilité',
                description: 'Analyse de votre consommation, étude technique de votre toiture, simulation financière détaillée',
              },
              {
                step: '2',
                title: 'Proposition sur mesure',
                description: 'Dimensionnement optimal, choix des équipements, plan de financement',
              },
              {
                step: '3',
                title: 'Installation professionnelle',
                description: 'Équipe dédiée, intervention hors heures d\'activité si nécessaire, mise en service',
              },
              {
                step: '4',
                title: 'Suivi & Maintenance',
                description: 'Monitoring en temps réel, maintenance préventive, support technique réactif',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-muted/30 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-semibold mb-2"><T>{item.title}</T></h3>
                  <p className="text-muted-foreground"><T>{item.description}</T></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Décideurs */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/entreprises/entreprises_01_decideurs.jpg"
                alt="Décideurs"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <T>Faites le bon choix pour votre entreprise</T>
              </h2>
              <TestimonialCard
                quote="L'installation solaire sur notre entrepôt nous fait économiser 45 000 ₪ par an. L'investissement sera rentabilisé en moins de 5 ans."
                author="Sarah M., Directrice Administrative, Tel Aviv"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - CTA Final */}
      <CTASection
        title="Demandez votre étude gratuite"
        text="Notre équipe analyse votre projet et vous propose une solution sur mesure sous 48h."
        primaryCTA={{
          text: '📞 Être rappelé',
          href: '#',
        }}
      />
    </div>
  )
}

