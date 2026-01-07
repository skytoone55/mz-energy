import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales | MZ Energy',
  description: 'Mentions légales de MZ Energy',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
            <p className="text-muted-foreground">
              Le site mz-energy.co.il est édité par MZ Energy.
            </p>
            <p className="text-muted-foreground">
              [Informations légales à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
            <p className="text-muted-foreground">
              [Informations d&apos;hébergement à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos) est la propriété de MZ Energy et est protégé par les lois sur la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Données personnelles</h2>
            <p className="text-muted-foreground">
              Pour plus d&apos;informations sur le traitement de vos données personnelles, consultez notre{' '}
              <a href="/confidentialite" className="text-primary hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

