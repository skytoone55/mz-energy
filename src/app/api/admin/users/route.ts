import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Helper pour vérifier que l'utilisateur est admin
 */
async function checkAdminAccess() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { authorized: false, error: 'Non authentifié', statusCode: 401 }
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Accès non autorisé', statusCode: 403 }
  }
  
  return { authorized: true, user }
}

/**
 * API Route pour récupérer tous les utilisateurs (admin only)
 * GET /api/admin/users
 */
export async function GET() {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 })
    }
    
    // Utiliser service role pour contourner RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    const { data: users, error: fetchError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Erreur récupération utilisateurs:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }
    
    return NextResponse.json({ users: users || [] })
    
  } catch (error) {
    console.error('Erreur API admin users GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour créer des utilisateurs (admin only)
 * POST /api/admin/users
 */
export async function POST(request: NextRequest) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }
    
    const body = await request.json()
    const { email, password, prenom, nom, role, societe } = body
    
    // Validation
    if (!email || !password || !prenom || !nom) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    // Créer l'utilisateur avec le service role
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local')
      return NextResponse.json({ 
        error: 'Configuration serveur manquante. Veuillez ajouter SUPABASE_SERVICE_ROLE_KEY dans .env.local' 
      }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Créer l'utilisateur auth
    const { data: authData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    
    if (createError) {
      console.error('Erreur création auth:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }
    
    // Créer le profil
    const { error: profileError } = await adminSupabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        prenom,
        nom,
        role: role || 'commercial',
        actif: true,
        societe: societe || null,
      })
    
    if (profileError) {
      console.error('Erreur création profil:', profileError)
      // Supprimer l'utilisateur auth si le profil échoue
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Erreur création profil' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, userId: authData.user.id })
    
  } catch (error) {
    console.error('Erreur API admin users:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour mettre à jour un utilisateur (admin only)
 * PATCH /api/admin/users
 */
export async function PATCH(request: NextRequest) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }
    
    const body = await request.json()
    const { userId, prenom, nom, role, actif, societe } = body
    
    // Validation
    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (prenom !== undefined) updateData.prenom = prenom
    if (nom !== undefined) updateData.nom = nom
    if (role !== undefined) updateData.role = role
    if (actif !== undefined) updateData.actif = actif
    if (societe !== undefined) updateData.societe = societe || null
    
    // Mettre à jour le profil
    const { error: updateError } = await adminSupabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
    
    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erreur API admin users PATCH:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour supprimer un utilisateur (admin only)
 * DELETE /api/admin/users?userId=...
 */
export async function DELETE(request: NextRequest) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
    }
    
    // Empêcher la suppression de soi-même
    const { user } = await checkAdminAccess()
    if (user && user.id === userId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Supprimer le profil (cascade supprimera aussi les données liées si configuré)
    const { error: deleteError } = await adminSupabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    
    if (deleteError) {
      console.error('Erreur suppression profil:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }
    
    // Supprimer l'utilisateur auth
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)
    
    if (authDeleteError) {
      console.error('Erreur suppression auth:', authDeleteError)
      // Le profil est déjà supprimé, on continue
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erreur API admin users DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

