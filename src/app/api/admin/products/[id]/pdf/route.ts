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

const BUCKET_NAME = 'product-pdfs'

/**
 * API Route pour uploader un PDF pour un produit
 * POST /api/admin/products/[id]/pdf
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const { id: productId } = await params
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Vérifier que le produit existe
    const { data: product, error: productError } = await adminSupabase
      .from('products')
      .select('id, reference')
      .eq('id', productId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }
    
    // Récupérer le fichier depuis FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }
    
    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 })
    }
    
    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
    }
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`
    
    // Supprimer l'ancien PDF s'il existe
    const { data: oldProduct } = await adminSupabase
      .from('products')
      .select('pdf_url')
      .eq('id', productId)
      .single()
    
    if (oldProduct?.pdf_url) {
      const oldPath = oldProduct.pdf_url.split('/').pop()
      if (oldPath) {
        await adminSupabase.storage
          .from(BUCKET_NAME)
          .remove([oldPath])
      }
    }
    
    // Convertir le fichier en ArrayBuffer puis en Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Uploader le nouveau PDF
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, uint8Array, {
        contentType: 'application/pdf',
        upsert: false,
      })
    
    if (uploadError) {
      console.error('Erreur upload PDF:', uploadError)
      return NextResponse.json({ error: 'Erreur lors de l\'upload du PDF' }, { status: 500 })
    }
    
    // Obtenir l'URL publique du PDF
    const { data: urlData } = adminSupabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)
    
    const pdfUrl = urlData.publicUrl
    
    // Mettre à jour le produit avec l'URL du PDF
    const { error: updateError } = await adminSupabase
      .from('products')
      .update({ pdf_url: pdfUrl })
      .eq('id', productId)
    
    if (updateError) {
      console.error('Erreur mise à jour produit:', updateError)
      // Nettoyer le fichier uploadé en cas d'erreur
      await adminSupabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, pdfUrl })
    
  } catch (error) {
    console.error('Erreur API admin products PDF POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * API Route pour supprimer le PDF d'un produit
 * DELETE /api/admin/products/[id]/pdf
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error, statusCode } = await checkAdminAccess()
    
    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 401 })
    }
    
    const { id: productId } = await params
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }
    
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    
    // Récupérer le produit avec son PDF
    const { data: product, error: productError } = await adminSupabase
      .from('products')
      .select('id, pdf_url')
      .eq('id', productId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }
    
    if (!product.pdf_url) {
      return NextResponse.json({ error: 'Aucun PDF associé à ce produit' }, { status: 400 })
    }
    
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = product.pdf_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    
    // Supprimer le fichier du storage
    const { error: deleteError } = await adminSupabase.storage
      .from(BUCKET_NAME)
      .remove([fileName])
    
    if (deleteError) {
      console.error('Erreur suppression PDF:', deleteError)
      // On continue quand même pour mettre à jour la base de données
    }
    
    // Mettre à jour le produit pour retirer l'URL
    const { error: updateError } = await adminSupabase
      .from('products')
      .update({ pdf_url: null })
      .eq('id', productId)
    
    if (updateError) {
      console.error('Erreur mise à jour produit:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erreur API admin products PDF DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

