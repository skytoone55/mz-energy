'use client'

import { useEffect, useState } from 'react'
import { 
  Package, 
  Sun,
  Zap,
  Battery,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

export default function AdminCataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
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
    </div>
  )
}

