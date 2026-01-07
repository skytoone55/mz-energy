import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * GET /api/contacts/[id]
 * Détail d'un contact avec ses simulations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Récupérer le contact
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    const { data: contact, error: contactError } = await query

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (!isAdmin && contact.commercial_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les simulations du contact
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: simulations, error: simError } = await adminSupabase
      .from('simulations')
      .select('id, nom_projet, created_at, statut, validated_at, conso_annuelle, surface_toit')
      .eq('contact_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      contact,
      simulations: simulations || [],
    })
  } catch (error) {
    console.error('Erreur API contacts GET [id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT /api/contacts/[id]
 * Modifier un contact
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Vérifier que le contact existe et les permissions
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('commercial_id')
      .eq('id', id)
      .single()

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      )
    }

    if (!isAdmin && existingContact.commercial_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nom, prenom, telephone, email, notes, adresse, ville } = body

    const { data: contact, error: updateError } = await supabase
      .from('contacts')
      .update({
        nom,
        prenom,
        telephone: telephone || null,
        email: email || null,
        notes: notes || null,
        adresse: adresse || null,
        ville: ville || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour contact:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Erreur API contacts PUT [id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/contacts/[id]
 * Supprimer un contact
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Vérifier que le contact existe et les permissions
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('commercial_id')
      .eq('id', id)
      .single()

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact non trouvé' },
        { status: 404 }
      )
    }

    if (!isAdmin && existingContact.commercial_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur suppression contact:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur API contacts DELETE [id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
