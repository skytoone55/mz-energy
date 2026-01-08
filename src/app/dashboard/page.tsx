import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Récupérer les simulations de l'utilisateur
  const { data: simulations, count } = await supabase
    .from('simulations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculer les stats
  const totalSimulations = count || 0
  const totalEconomies = simulations?.reduce((acc, sim) => {
    const resultats = sim.resultats as { scenarios: { economiesAnnuelles: number }[] }
    if (!resultats?.scenarios?.length) return acc
    const maxEconomies = Math.max(...resultats.scenarios.map(s => s.economiesAnnuelles))
    return acc + maxEconomies
  }, 0) || 0

  const simulationsThisMonth = simulations?.filter(s => {
    const date = new Date(s.created_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length || 0

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('prenom')
    .eq('id', user.id)
    .single()

  // Formatter les simulations pour le composant client
  const formattedSimulations = simulations?.map(sim => ({
    id: sim.id,
    nom_projet: sim.nom_projet,
    created_at: sim.created_at,
    conso_annuelle: sim.conso_annuelle,
    surface_toit: sim.surface_toit,
    resultats: sim.resultats as {
      scenarios: { economiesAnnuelles: number; id: string }[]
      meilleurScenario: string
    }
  })) || []

  return (
    <DashboardContent
      prenom={profile?.prenom || ''}
      simulations={formattedSimulations}
      totalSimulations={totalSimulations}
      totalEconomies={totalEconomies}
      simulationsThisMonth={simulationsThisMonth}
    />
  )
}
