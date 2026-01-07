import { Metadata } from 'next'
import Image from 'next/image'
import { Building, Sun, Check, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { FAQ } from '@/components/ui/faq'

export const metadata: Metadata = {
  title: 'Investir dans le Solaire | MZ Energy',
  description: 'Investissez dans l\'énergie solaire en Israël. Location de toiture, fermes solaires. Rendement 8-12%.',
}

export default function InvestisseursPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="Investissez dans l'énergie solaire"
        subtitle="Transformez vos toitures ou terrains en actifs rentables. Revenus stables, long terme, impact positif."
        primaryCTA={{
          text: '📞 Discuter de mon projet',
          href: '#',
        }}
        backgroundImage="/images/investisseurs/investisseurs_01_grande_echelle.jpg"
      />

      {/* Section 2 - Opportunités d'investissement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Deux modèles d'investissement
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Modèle 1 - Location de toiture */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-xl bg-solar-gradient flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Louez votre toiture</h3>
                <p className="text-muted-foreground">
                  Vous possédez un bâtiment avec une grande toiture ? Louez-la à MZ Energy. Nous installons, exploitons et maintenons. Vous percevez un loyer garanti.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Avantages :</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Aucun investissement de votre part
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Loyer garanti sur 20-25 ans
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Toiture rénovée et entretenue
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Valorisation de votre patrimoine
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Rendement :</strong> Loyer fixe ou % de production
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Modèle 2 - Ferme solaire */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-xl bg-energy-gradient flex items-center justify-center">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Développez une ferme solaire</h3>
                <p className="text-muted-foreground">
                  Vous disposez de terrains ou souhaitez investir dans un projet solaire ? Nous développons des centrales photovoltaïques clé en main avec des rendements attractifs.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Avantages :</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Rendement 8-12% annuel
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Revenus garantis sur 25 ans
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Actif tangible et durable
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Impact environnemental positif
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Rendement :</strong> ROI 8-12% / an
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3 - Chiffres clés */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/investisseurs/investisseurs_02_roi.jpg"
                alt="ROI"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8">
                Pourquoi le solaire est un bon investissement
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { chiffre: '8-12%', description: 'Rendement annuel moyen' },
                  { chiffre: '25 ans', description: 'Durée des contrats de rachat' },
                  { chiffre: '5-7 ans', description: 'Retour sur investissement' },
                  { chiffre: '0.5%/an', description: 'Dégradation des panneaux (très faible)' },
                  { chiffre: '1 800h', description: 'Ensoleillement annuel en Israël' },
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{item.chiffre}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Processus investisseur */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment investir avec MZ Energy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Évaluation',
                description: 'Analyse de votre surface (toiture ou terrain), étude de productible',
              },
              {
                step: '2',
                title: 'Proposition',
                description: 'Business plan détaillé, projection de revenus, schéma juridique',
              },
              {
                step: '3',
                title: 'Réalisation',
                description: 'Installation par nos équipes, raccordement au réseau',
              },
              {
                step: '4',
                title: 'Exploitation',
                description: 'Monitoring, maintenance, reversement des revenus',
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
        </div>
      </section>

      {/* Section 5 - FAQ Investisseurs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
          </div>

          <FAQ
            items={[
              {
                question: 'Quel est l\'investissement minimum ?',
                answer: 'Pour une location de toiture : aucun investissement, nous finançons l\'installation. Pour une ferme solaire : à partir de 500 000 ₪, selon la taille du projet.',
              },
              {
                question: 'Les revenus sont-ils garantis ?',
                answer: 'Oui. Les contrats de rachat d\'électricité en Israël sont garantis par l\'État sur 20-25 ans à un tarif fixé à l\'avance.',
              },
              {
                question: 'Quelle surface minimum pour un projet ?',
                answer: 'Location de toiture : à partir de 500 m². Ferme solaire : à partir de 5 000 m².',
              },
            ]}
          />
        </div>
      </section>

      {/* Section 6 - CTA Final */}
      <CTASection
        title="Étudions votre projet d'investissement"
        text="Notre équipe vous accompagne dans l'analyse et la structuration de votre projet solaire."
        primaryCTA={{
          text: '📞 Prendre rendez-vous',
          href: '#',
        }}
        secondaryCTA={{
          text: '✉️ Envoyer les détails de mon projet',
          href: '/contact',
          action: 'link',
        }}
      />
    </div>
  )
}

