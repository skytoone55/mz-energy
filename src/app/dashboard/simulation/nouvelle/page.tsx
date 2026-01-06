import { createClient } from '@/lib/supabase/server'
import { SimulationForm } from '@/components/simulation-form'

export default async function NouvelleSimulationPage() {
  const supabase = await createClient()

  // Charger les paramètres système
  const { data: config } = await supabase
    .from('system_config')
    .select('key, value')
    .in('key', ['prix_achat_kwh', 'prix_revente_kwh'])

  // Extraire les valeurs avec des fallbacks
  const prixAchatKwh = config?.find(c => c.key === 'prix_achat_kwh')?.value ?? 0.55
  const prixReventeKwh = config?.find(c => c.key === 'prix_revente_kwh')?.value ?? 0.23

  return (
    <SimulationForm 
      defaultPrixAchatKwh={Number(prixAchatKwh)}
      defaultPrixReventeKwh={Number(prixReventeKwh)}
    />
  )
}

