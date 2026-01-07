import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * GET /api/contacts
 * Liste des contacts du commercial (ou tous pour admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 403 })
    }

    const isAdmin = profile.role === 'admin'
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // 1. Récupérer les contacts commerciaux
    let contactsQuery = adminSupabase
      .from('contacts')
      .select('*, commercial:user_profiles!commercial_id(id, prenom, nom, email)')
      .order('created_at', { ascending: false })

    // Si admin, voir tous les contacts, sinon uniquement les siens
    if (!isAdmin) {
      contactsQuery = contactsQuery.eq('commercial_id', user.id)
    }

    // Recherche si fournie
    if (search) {
      contactsQuery = contactsQuery.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,telephone.ilike.%${search}%`)
    }

    const { data: contacts, error } = await contactsQuery

    if (error) {
      console.error('Erreur récupération contacts:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // 2. Récupérer les leads assignés à des commerciaux (qui ont des simulations commerciales)
    let leadsQuery = adminSupabase
      .from('leads')
      .select(`
        *,
        simulations!inner(
          id,
          user_id,
          user_profiles:user_id(id, prenom, nom, email)
        )
      `)
      .order('created_at', { ascending: false })

    // Filtrer par commercial si pas admin
    if (!isAdmin) {
      leadsQuery = leadsQuery.eq('simulations.user_id', user.id)
    }

    // Recherche si fournie
    if (search) {
      leadsQuery = leadsQuery.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,telephone.ilike.%${search}%`)
    }

    const { data: leadsData, error: leadsError } = await leadsQuery

    if (leadsError) {
      console.error('Erreur récupération leads:', leadsError)
    }

    // 3. Formater les leads comme des contacts
    const formattedLeads = (leadsData || []).map((lead: any) => {
      const simulation = lead.simulations?.[0]
      const commercial = simulation?.user_profiles
      return {
        id: `lead_${lead.id}`, // Préfixe pour distinguer
        nom: lead.nom,
        prenom: lead.prenom,
        telephone: lead.telephone,
        email: lead.email,
        notes: null,
        type: 'lead' as const,
        lead_id: lead.id,
        commercial: commercial ? {
          id: commercial.id,
          prenom: commercial.prenom,
          nom: commercial.nom,
          email: commercial.email,
        } : null,
        created_at: lead.created_at,
      }
    })

    // 4. Marquer les contacts comme type 'contact'
    const formattedContacts = (contacts || []).map((contact: any) => ({
      ...contact,
      type: 'contact' as const,
    }))

    // 5. Compter les simulations par contact/lead
    const contactIds = formattedContacts.map(c => c.id)
    const leadIds = formattedLeads.map(l => l.lead_id)

    if (contactIds.length > 0) {
      const { data: simCountsContacts } = await adminSupabase
        .from('simulations')
        .select('contact_id')
        .in('contact_id', contactIds)

      const counts = simCountsContacts?.reduce((acc: Record<string, number>, sim) => {
        if (sim.contact_id) {
          acc[sim.contact_id] = (acc[sim.contact_id] || 0) + 1
        }
        return acc
      }, {}) || {}

      formattedContacts.forEach(contact => {
        (contact as any).nb_simulations = counts[contact.id] || 0
      })
    }

    if (leadIds.length > 0) {
      const { data: simCountsLeads } = await adminSupabase
        .from('simulations')
        .select('lead_id')
        .in('lead_id', leadIds)

      const counts = simCountsLeads?.reduce((acc: Record<string, number>, sim) => {
        if (sim.lead_id) {
          acc[sim.lead_id] = (acc[sim.lead_id] || 0) + 1
        }
        return acc
      }, {}) || {}

      formattedLeads.forEach(lead => {
        (lead as any).nb_simulations = counts[lead.lead_id] || 0
      })
    }

    // 6. Fusionner et trier
    const allContacts = [...formattedContacts, ...formattedLeads].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({ contacts: allContacts })
  } catch (error) {
    console.error('Erreur API contacts GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/contacts
 * Créer un nouveau contact
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { nom, prenom, telephone, email, notes, adresse, ville } = body

    if (!nom || !prenom) {
      return NextResponse.json(
        { error: 'Nom et prénom sont obligatoires' },
        { status: 400 }
      )
    }

    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        nom,
        prenom,
        telephone: telephone || null,
        email: email || null,
        notes: notes || null,
        adresse: adresse || null,
        ville: ville || null,
        commercial_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création contact:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Erreur API contacts POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
