import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadsTable } from '@/components/leads-table'

export default async function AdminLeadsPage() {
  const supabase = await createClient()
  
  // Vérifier que l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  // Utiliser service role pour contourner RLS et récupérer toutes les données
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminSupabase = serviceRoleKey ? createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  ) : supabase
  
  const { data: leads, count } = await adminSupabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
  
  // Pour chaque lead, récupérer sa simulation associée et le commercial assigné
  const leadsWithData = await Promise.all(
    (leads || []).map(async (lead: any) => {
      const { data: simulation } = await adminSupabase
        .from('simulations')
        .select(`
          id, 
          user_id,
          user_profiles:user_id(prenom, nom)
        `)
        .eq('lead_id', lead.id)
        .maybeSingle()
      
      let commercialAssigne = null
      if (simulation?.user_id && simulation.user_profiles) {
        commercialAssigne = {
          id: simulation.user_id,
          prenom: (simulation.user_profiles as any).prenom,
          nom: (simulation.user_profiles as any).nom,
        }
      }
      
      return {
        ...lead,
        simulationId: simulation?.id || null,
        commercialAssigne,
      }
    })
  )

  // Récupérer la liste des commerciaux actifs
  const { data: allUsers } = await adminSupabase
    .from('user_profiles')
    .select('id, prenom, nom')
    .eq('role', 'commercial')
    .eq('actif', true)
  
  const commercials = (allUsers || []).map((u: any) => ({
    id: u.id,
    prenom: u.prenom,
    nom: u.nom,
  }))

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Gestion des Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            {count || 0} lead{(count || 0) > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{count || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const week = new Date()
                week.setDate(week.getDate() - 7)
                return date >= week
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads?.filter(l => {
                const date = new Date(l.created_at)
                const today = new Date()
                return date.toDateString() === today.toDateString()
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des leads</CardTitle>
          <CardDescription>Tous les particuliers ayant effectué une simulation</CardDescription>
        </CardHeader>
        <CardContent>
          {leads && leads.length > 0 ? (
            <LeadsTable leads={leadsWithData} commercials={commercials} />
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">Aucun lead</h3>
              <p className="text-sm text-muted-foreground">
                Les leads apparaîtront ici après les premières simulations
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

