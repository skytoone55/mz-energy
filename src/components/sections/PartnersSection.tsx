import Image from 'next/image'

interface PartnersSectionProps {
  backgroundImage?: string
}

export function PartnersSection({ backgroundImage }: PartnersSectionProps) {
  return (
    <section
      className="py-10 px-4 sm:px-6 lg:px-8"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Nos partenaires
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des équipements premium de fabricants reconnus
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* MAZDA */}
          <div className="bg-card rounded-xl p-8 border text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/images/partners/mazda.png"
                alt="Logo MAZDA"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">MAZDA</h3>
            <p className="text-muted-foreground mb-2">Panneaux solaires & Batteries</p>
            <p className="text-sm text-muted-foreground">Distributeur exclusif en Israël</p>
          </div>

          {/* DEYE */}
          <div className="bg-card rounded-xl p-8 border text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/images/partners/deye.png"
                alt="Logo DEYE"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">DEYE</h3>
            <p className="text-muted-foreground mb-2">Onduleurs</p>
            <p className="text-sm text-muted-foreground">Fiabilité et compatibilité reconnues</p>
          </div>
        </div>
      </div>
    </section>
  )
}

