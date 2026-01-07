import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Rocket, Sun, Users, GraduationCap, MapPin, Gift,
  Wrench, Calculator, Headphones, Code, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'

export const metadata: Metadata = {
  title: 'Recrutement | MZ Energy Israël',
  description: 'Rejoignez MZ Energy ! Offres d\'emploi dans l\'énergie solaire en Israël.',
}

export default function CarrieresPage() {
  return (
    <div className="min-h-screen">
      {/* Section 1 - Hero */}
      <HeroSection
        title="Rejoignez MZ Energy"
        subtitle="Participez à la révolution solaire en Israël. Nous cherchons des talents passionnés pour construire l'énergie de demain."
        primaryCTA={{
          text: 'Voir les offres',
          href: '#offres',
        }}
        backgroundImage="/images/carrieres/carrieres_01_hero_recrutement.jpg"
      />

      {/* Section 2 - Pourquoi nous rejoindre */}
      <section id="offres" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi rejoindre MZ Energy ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket,
                title: 'Entreprise en croissance',
                texte: 'Rejoignez une startup en pleine expansion sur un marché porteur',
              },
              {
                icon: Sun,
                title: 'Impact positif',
                texte: 'Contribuez concrètement à la transition énergétique',
              },
              {
                icon: Users,
                title: 'Équipe soudée',
                texte: 'Intégrez une équipe passionnée et bienveillante',
              },
              {
                icon: GraduationCap,
                title: 'Formation continue',
                texte: 'Développez vos compétences avec des formations régulières',
              },
              {
                icon: MapPin,
                title: 'Flexibilité',
                texte: 'Télétravail partiel possible selon les postes',
              },
              {
                icon: Gift,
                title: 'Avantages',
                texte: 'Package attractif et avantages collaborateurs',
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.texte}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Notre culture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/carrieres/carrieres_02_vie_equipe.jpg"
                alt="Vie d'équipe"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                La vie chez MZ Energy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Chez MZ Energy, nous cultivons un environnement de travail où chacun peut s&apos;épanouir et contribuer. Nous valorisons l&apos;initiative, l&apos;entraide et la bonne humeur.
                </p>
                <p>
                  Nos équipes se retrouvent régulièrement pour des moments de convivialité : déjeuners d&apos;équipe, événements team building, célébrations des succès collectifs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Nos métiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nos métiers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wrench,
                metier: 'Techniciens installateurs',
                description: 'Installation et maintenance des systèmes photovoltaïques',
              },
              {
                icon: Users,
                metier: 'Commerciaux',
                description: 'Conseil et accompagnement des clients particuliers et professionnels',
              },
              {
                icon: Calculator,
                metier: 'Chargés d\'études',
                description: 'Dimensionnement et conception des installations',
              },
              {
                icon: Headphones,
                metier: 'Support client',
                description: 'Accompagnement et suivi de la satisfaction client',
              },
              {
                icon: Code,
                metier: 'Tech & IT',
                description: 'Développement des outils digitaux et monitoring',
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-solar-gradient flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.metier}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Offres d'emploi */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nos offres actuelles
            </h2>
          </div>

          <div className="space-y-6">
            {/* Offre 1 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      🔧 Technicien installateur PV (H/F)
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📍 Région Centre (Tel Aviv / Netanya)</span>
                      <span>📄 CDI - Temps plein</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Vous installez et mettez en service les systèmes photovoltaïques chez nos clients particuliers et professionnels.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  Postuler
                </Button>
              </CardContent>
            </Card>

            {/* Offre 2 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      💼 Commercial terrain (H/F)
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📍 Tout Israël</span>
                      <span>📄 CDI - Temps plein</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Vous développez le portefeuille clients et accompagnez les prospects jusqu&apos;à la signature.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  Postuler
                </Button>
              </CardContent>
            </Card>

            {/* Candidature spontanée */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Vous ne trouvez pas le poste idéal ? Envoyez-nous votre candidature spontanée !
                </p>
                <a href="mailto:recrutement@mz-energy.co.il">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Candidature spontanée
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 6 - CTA Final */}
      <CTASection
        title="Prêt à rejoindre l'aventure ?"
        text="Envoyez-nous votre CV et rejoignez une équipe passionnée par l'énergie de demain."
        primaryCTA={{
          text: '✉️ Envoyer ma candidature',
          href: 'mailto:recrutement@mz-energy.co.il',
        }}
        secondaryCTA={{
          text: '📞 Nous contacter',
          href: '/contact',
          action: 'link',
        }}
      />
    </div>
  )
}

