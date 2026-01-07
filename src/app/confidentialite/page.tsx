import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | MZ Energy',
  description: 'Politique de confidentialité de MZ Energy',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Collecte des données</h2>
            <p className="text-muted-foreground">
              MZ Energy collecte les données personnelles que vous nous fournissez volontairement lors de l&apos;utilisation de nos services (simulation, formulaire de contact, demande de rappel).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Utilisation des données</h2>
            <p className="text-muted-foreground">
              Vos données personnelles sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Répondre à vos demandes et vous contacter</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des informations sur nos produits et services (avec votre consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Conservation des données</h2>
            <p className="text-muted-foreground">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à la réglementation en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition concernant vos données personnelles. Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:contact@mz-energy.co.il" className="text-primary hover:underline">
                contact@mz-energy.co.il
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

