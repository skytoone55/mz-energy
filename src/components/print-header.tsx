import { User, Mail, Phone } from 'lucide-react'

interface ContactInfo {
  nom: string
  prenom: string
  email?: string
  telephone?: string
}

interface PrintHeaderProps {
  simulationName?: string
  date: string
  contact?: ContactInfo
}

export function PrintHeader({ simulationName, date, contact }: PrintHeaderProps) {
  // Afficher uniquement l'encadré contact, sans le header logo/nom
  return (
    <>
      {/* Encadré informations contact */}
      {contact && (
        <div className="hidden print-show mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Informations client</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium text-gray-900">{contact.prenom} {contact.nom}</p>
            </div>
            {contact.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{contact.email}</p>
                </div>
              </div>
            )}
            {contact.telephone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{contact.telephone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

