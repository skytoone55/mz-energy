'use client'

import { useEffect, useState } from 'react'
import { 
  Settings, 
  Save,
  Loader2,
  DollarSign,
  Percent,
  Sun,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface SystemConfig {
  id: string
  key: string
  value: number
  description: string
}

export default function AdminParametresPage() {
  const [config, setConfig] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    const { data } = await supabase
      .from('system_config')
      .select('*')
      .order('key')
    
    if (data) setConfig(data)
    setLoading(false)
  }

  function updateValue(key: string, value: number) {
    setConfig(prev => prev.map(c => 
      c.key === key ? { ...c, value } : c
    ))
  }

  async function saveConfig() {
    setSaving(true)
    setMessage(null)

    try {
      for (const item of config) {
        await supabase
          .from('system_config')
          .update({ value: item.value })
          .eq('key', item.key)
      }
      
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' })
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  const configGroups = {
    'Tarifs électriques': ['prix_achat_kwh', 'prix_revente_kwh'],
    'Marges': ['marge_globale', 'tva'],
    'Installation': ['cout_installation_kwc', 'frais_fixes'],
    'Production': ['irradiation_annuelle', 'rendement_systeme'],
  }

  const configLabels: Record<string, { label: string; unit: string; icon: React.ReactNode }> = {
    prix_achat_kwh: { label: 'Prix achat kWh', unit: '₪', icon: <DollarSign className="w-4 h-4" /> },
    prix_revente_kwh: { label: 'Prix revente kWh', unit: '₪', icon: <DollarSign className="w-4 h-4" /> },
    marge_globale: { label: 'Marge globale', unit: '%', icon: <Percent className="w-4 h-4" /> },
    tva: { label: 'TVA', unit: '%', icon: <Percent className="w-4 h-4" /> },
    cout_installation_kwc: { label: 'Coût installation', unit: '₪/kWc', icon: <Settings className="w-4 h-4" /> },
    frais_fixes: { label: 'Frais fixes', unit: '₪', icon: <DollarSign className="w-4 h-4" /> },
    irradiation_annuelle: { label: 'Irradiation annuelle', unit: 'kWh/m²', icon: <Sun className="w-4 h-4" /> },
    rendement_systeme: { label: 'Rendement système', unit: '%', icon: <Zap className="w-4 h-4" /> },
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Paramètres système
          </h1>
          <p className="text-muted-foreground mt-1">
            Configuration globale des calculs et tarifs
          </p>
        </div>
        
        <Button 
          onClick={saveConfig}
          disabled={saving}
          className="bg-solar-gradient hover:opacity-90 text-white gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-energy/10 text-energy' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      {/* Config Groups */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(configGroups).map(([groupName, keys]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {keys.map(key => {
                const item = config.find(c => c.key === key)
                const meta = configLabels[key]
                
                if (!item || !meta) return null
                
                const displayValue = key.includes('marge') || key === 'tva' || key === 'rendement_systeme'
                  ? item.value * 100
                  : item.value
                
                return (
                  <div key={key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {meta.icon}
                      {meta.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={displayValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          const storeVal = key.includes('marge') || key === 'tva' || key === 'rendement_systeme'
                            ? val / 100
                            : val
                          updateValue(key, storeVal)
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {meta.unit}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

