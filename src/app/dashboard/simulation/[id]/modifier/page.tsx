import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SimulationForm } from '@/components/simulation-form'

export default async function ModifierSimulationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Charger la simulation
  const { data: simulation } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single()

  if (!simulation) {
    notFound()
  }

  // Vérifier les permissions (propriétaire ou admin)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (simulation.user_id !== user.id && profile?.role !== 'admin') {
    redirect('/dashboard/simulations')
  }

  // Charger les paramètres système pour les valeurs par défaut
  const { data: config } = await supabase
    .from('system_config')
    .select('key, value')
    .in('key', ['prix_achat_kwh', 'prix_revente_kwh'])

  const prixAchatKwh = config?.find(c => c.key === 'prix_achat_kwh')?.value ?? 0.55
  const prixReventeKwh = config?.find(c => c.key === 'prix_revente_kwh')?.value ?? 0.23

  // Préparer les valeurs initiales
  const initialValues = {
    nomProjet: simulation.nom_projet || '',
    consoAnnuelle: simulation.conso_annuelle,
    partJour: simulation.part_jour,
    surfaceToit: simulation.surface_toit,
    prixAchatKwh: simulation.prix_achat_kwh,
    prixReventeKwh: simulation.prix_revente_kwh,
  }

  return (
    <SimulationForm 
      defaultPrixAchatKwh={Number(prixAchatKwh)}
      defaultPrixReventeKwh={Number(prixReventeKwh)}
      initialValues={initialValues}
      simulationId={id}
      mode="edit"
    />
  )
}

