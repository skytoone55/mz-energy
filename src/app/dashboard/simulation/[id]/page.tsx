import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/pv-engine'
import type { ScenarioWithPrice } from '@/lib/price-engine'
import { ExportPDFButton } from '@/components/export-pdf-button'
import { SimulationDetailClient } from '@/components/simulation-detail-client'
import { EditableSimulationName } from '@/components/editable-simulation-name'
import { PrintHeader } from '@/components/print-header'
import { ValidateSimulationButton } from '@/components/validate-simulation-button'
import { AssignContactButton } from '@/components/assign-contact-button'
import { User, Phone, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SimulationResultats {
  scenarios: ScenarioWithPrice[]
  meilleurScenario: string
  feasibility: {
    possible: boolean
    warnings: string[]
  }
}

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Désactiver le cache pour forcer le rechargement des données
  noStore()
  
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Vérifier le rôle pour autoriser les admins à voir toutes les simulations
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Si admin, ne pas filtrer par user_id
  // Forcer le rechargement sans cache
  let query = supabase
    .from('simulations')
    .select(`
      *,
      contacts(id, nom, prenom, telephone, email, notes),
      leads(id, nom, prenom, telephone, email)
    `)
    .eq('id', id)

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data: simulation, error: simError } = await query.single()
  
  // Si erreur ou simulation non trouvée, retourner 404
  if (simError || !simulation) {
    notFound()
  }

  const resultats = simulation.resultats as SimulationResultats
  const scenarios = resultats.scenarios
  
  // Récupérer le contact ou le lead
  const contact = (simulation as any).contacts
  const lead = (simulation as any).leads
  const clientInfo = contact || lead
  const isCommercial = simulation.type === 'commercial'
  const hasContact = !!contact

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/simulations" className="pdf-hide">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <EditableSimulationName
              simulationId={simulation.id}
              currentName={simulation.nom_projet}
              canEdit={isAdmin || (!!profile && (profile.role === 'commercial' || simulation.user_id === user.id))}
            />
            <p className="text-muted-foreground">
              {new Date(simulation.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pdf-hide">
          <ValidateSimulationButton
            simulationId={simulation.id}
            currentStatus={simulation.statut as 'en_cours' | 'validee'}
            validatedAt={simulation.validated_at || undefined}
            canValidate={isAdmin || simulation.user_id === user.id}
          />
          {isCommercial && !hasContact && (
            <AssignContactButton
              simulationId={simulation.id}
            />
          )}
          <Link href={`/dashboard/simulation/${simulation.id}/modifier`}>
            <Button variant="outline">
              Modifier
            </Button>
          </Link>
          <ExportPDFButton simulation={simulation} showPrices={true} />
        </div>
      </div>

      {/* Informations contact/lead */}
      {clientInfo && (
        <Card className="pdf-hide">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-solar" />
              {contact ? 'Contact client' : 'Lead'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{clientInfo.prenom} {clientInfo.nom}</p>
              </div>
              {clientInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{clientInfo.email}</p>
                  </div>
                </div>
              )}
              {clientInfo.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{clientInfo.telephone}</p>
                  </div>
                </div>
              )}
              {contact && contact.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{contact.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu à exporter en PDF */}
      <div id="simulation-pdf-content">
      {/* En-tête d'impression - visible uniquement lors de l'impression */}
      <PrintHeader 
        simulationName={simulation.nom_projet || `Simulation #${simulation.id.slice(0, 8)}`}
        date={new Date(simulation.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
        contact={contact ? {
          nom: contact.nom,
          prenom: contact.prenom,
          email: contact.email || undefined,
          telephone: contact.telephone || undefined,
        } : lead ? {
          nom: lead.nom,
          prenom: lead.prenom,
          email: lead.email || undefined,
          telephone: lead.telephone || undefined,
        } : undefined}
      />
      
      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Consommation</p>
              <p className="text-lg font-semibold">{formatNumber(simulation.conso_annuelle)} kWh/an</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Part jour</p>
              <p className="text-lg font-semibold">{simulation.part_jour}%</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Surface</p>
              <p className="text-lg font-semibold">{simulation.surface_toit} m²</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Prix achat</p>
              <p className="text-lg font-semibold">{simulation.prix_achat_kwh} ₪/kWh</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Prix revente</p>
              <p className="text-lg font-semibold">{simulation.prix_revente_kwh} ₪/kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scénarios avec onglets si nécessaire - Client Component pour gérer l'état */}
      <SimulationDetailClient 
        simulation={simulation}
        showPrices={true}
      />
      
      {/* Élément caché pour stocker les données filtrées pour le PDF */}
      <div className="hidden" id="pdf-export-data" />
      </div>
    </div>
  )
}

