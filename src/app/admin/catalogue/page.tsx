'use client'

import { useEffect, useState } from 'react'
import { 
  Package, 
  Sun,
  Zap,
  Battery,
  Loader2,
  FileText,
  Upload,
  Download,
  Trash2,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { formatShekel } from '@/lib/pv-engine'

interface Product {
  id: string
  category: 'panneau' | 'onduleur_ongrid' | 'onduleur_hybride' | 'batterie'
  reference: string
  puissance_w: number | null
  pv_max_kwc: number | null
  capacite_kwh: number | null
  prix_revient: number
  actif: boolean
  pdf_url?: string | null
}

export default function AdminCataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pdfDialogOpen, setPdfDialogOpen] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('category, reference')
    
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Le fichier doit être un PDF')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10MB)')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUploadPdf = async (productId: string) => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`/api/admin/products/${productId}/pdf`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload')
      }

      setPdfDialogOpen(null)
      setSelectedFile(null)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePdf = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) {
      return
    }

    setDeleting(productId)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}/pdf`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const openPdfDialog = (productId: string) => {
    setPdfDialogOpen(productId)
    setSelectedFile(null)
    setError(null)
  }

  const productTypes = [
    { key: 'panneau', label: 'Panneaux solaires', icon: Sun },
    { key: 'onduleur_ongrid', label: 'Onduleurs On-Grid', icon: Zap },
    { key: 'onduleur_hybride', label: 'Onduleurs Hybrides', icon: Zap },
    { key: 'batterie', label: 'Batteries', icon: Battery },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Catalogue produits
        </h1>
        <p className="text-muted-foreground mt-1">
          {products.length} produit{products.length > 1 ? 's' : ''} au catalogue
        </p>
      </div>

      {/* Products by Type */}
      {productTypes.map(({ key, label, icon: Icon }) => {
        const typeProducts = products.filter(p => p.category === key)
        
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-solar" />
                {label}
              </CardTitle>
              <CardDescription>
                {typeProducts.length} produit{typeProducts.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {typeProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-muted-foreground">Référence</th>
                        {key === 'panneau' && (
                          <th className="text-left p-3 font-medium text-muted-foreground">Puissance</th>
                        )}
                        {(key === 'onduleur_ongrid' || key === 'onduleur_hybride') && (
                          <th className="text-left p-3 font-medium text-muted-foreground">PV Max</th>
                        )}
                        {key === 'batterie' && (
                          <th className="text-left p-3 font-medium text-muted-foreground">Capacité</th>
                        )}
                        <th className="text-left p-3 font-medium text-muted-foreground">Prix revient</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">PDF</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-secondary/50">
                          <td className="p-3 font-medium">{product.reference}</td>
                          {key === 'panneau' && (
                            <td className="p-3">{product.puissance_w} W</td>
                          )}
                          {(key === 'onduleur_ongrid' || key === 'onduleur_hybride') && (
                            <td className="p-3">{product.pv_max_kwc} kWc</td>
                          )}
                          {key === 'batterie' && (
                            <td className="p-3">{product.capacite_kwh} kWh</td>
                          )}
                          <td className="p-3 font-semibold text-solar">
                            {formatShekel(product.prix_revient)}
                          </td>
                          <td className="p-3">
                            <Badge variant={product.actif ? 'default' : 'secondary'}>
                              {product.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {product.pdf_url ? (
                              <Badge variant="default" className="gap-1">
                                <FileText className="w-3 h-3" />
                                PDF disponible
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Aucun</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {product.pdf_url && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(product.pdf_url!, '_blank')}
                                    className="gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePdf(product.id)}
                                    disabled={deleting === product.id}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    {deleting === product.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPdfDialog(product.id)}
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                {product.pdf_url ? 'Modifier' : 'Ajouter'} PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucun produit de ce type
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Dialog pour upload PDF */}
      <Dialog open={!!pdfDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setPdfDialogOpen(null)
          setSelectedFile(null)
          setError(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {products.find(p => p.id === pdfDialogOpen)?.pdf_url ? 'Modifier le PDF' : 'Ajouter un PDF'}
            </DialogTitle>
            <DialogDescription>
              Pour le produit : {products.find(p => p.id === pdfDialogOpen)?.reference}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fichier PDF (max 10MB)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPdfDialogOpen(null)
                setSelectedFile(null)
                setError(null)
              }}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button
              onClick={() => pdfDialogOpen && handleUploadPdf(pdfDialogOpen)}
              disabled={uploading || !selectedFile}
              className="bg-solar-gradient hover:opacity-90 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {products.find(p => p.id === pdfDialogOpen)?.pdf_url ? 'Remplacer' : 'Ajouter'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

