'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPDFButtonProps {
  simulation: {
    id: string
    nom_projet?: string
    created_at: string
    conso_annuelle: number
    part_jour: number
    surface_toit: number
    prix_achat_kwh: number
    prix_revente_kwh: number
    resultats: unknown
  }
  showPrices?: boolean
}

export function ExportPDFButton({ simulation, showPrices = false }: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [user, setUser] = useState<{ prenom: string; nom: string; email: string } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('prenom, nom, email')
          .eq('id', authUser.id)
          .single()
        if (profile) setUser(profile)
      }
    }
    loadUser()
  }, [supabase])

  const handleExport = async () => {
    setExporting(true)
    let element: HTMLElement | null = null
    let parentElement: HTMLElement | null = null
    let originalPaddingTop = ''
    
    try {
      // Trouver l'élément à capturer
      element = document.getElementById('simulation-pdf-content')
      if (!element) {
        console.error('Élément simulation-pdf-content non trouvé')
        alert('Élément de simulation non trouvé. Veuillez recharger la page.')
        return
      }

      console.log('Export PDF: Élément trouvé, dimensions:', element.offsetWidth, 'x', element.offsetHeight)

      // Ajouter une classe au body pour masquer les boutons
      document.body.classList.add('pdf-exporting')
      
      // Stocker les styles originaux de la page parent
      parentElement = element.parentElement
      originalPaddingTop = parentElement?.style.paddingTop || ''
      
      // Retirer le padding-top de la page parent lors de l'export (pt-16 lg:pt-0)
      if (parentElement) {
        parentElement.style.paddingTop = '0'
      }
      
      // Attendre un peu pour que les styles se appliquent et que le rendu soit stable
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('Export PDF: Démarrage capture html2canvas...')

      // Capturer l'élément avec html2canvas
      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: true, // Activer le logging pour debug
        allowTaint: true, // Permettre les images cross-origin
      })

      console.log('Export PDF: Canvas créé, dimensions:', canvas.width, 'x', canvas.height)

      // Restaurer l'affichage des boutons et le padding
      document.body.classList.remove('pdf-exporting')
      if (parentElement) {
        if (originalPaddingTop) {
          parentElement.style.paddingTop = originalPaddingTop
        } else {
          parentElement.style.paddingTop = ''
        }
      }

      // Vérifier que le canvas n'est pas vide
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vide - impossible de capturer l\'élément')
      }

      // Créer le PDF
      console.log('Export PDF: Création du PDF...')
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight
      
      // Dimensions disponibles sur une page (avec marges et header/footer)
      const margin = 10
      const headerHeight = 20
      const footerHeight = 10
      const availableWidth = pageWidth - (2 * margin)
      const availableHeight = pageHeight - headerHeight - footerHeight - (2 * margin)
      
      // Calculer les dimensions de l'image pour tenir dans une page
      let imgWidthMM = availableWidth
      let imgHeightMM = imgWidthMM / ratio
      
      // Fonction pour ajouter le header
      const addHeader = () => {
        pdf.setFillColor(245, 158, 11)
        pdf.rect(0, 0, pageWidth, headerHeight, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('MZ ENERGY', margin, headerHeight / 2 + 4)
        pdf.setFontSize(10)
        pdf.text('Simulation Photovoltaïque', pageWidth - margin, headerHeight / 2 + 4, { align: 'right' })
      }
      
      // Si l'image est trop haute, on la divise en plusieurs pages
      if (imgHeightMM > availableHeight) {
        // Calculer combien de pages sont nécessaires
        const totalPages = Math.ceil(imgHeightMM / availableHeight)
        const imgHeightPerPage = imgHeight / totalPages
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage()
          }
          
          addHeader()
          
          // Calculer la portion à afficher
          const sourceY = imgHeightPerPage * i
          const sourceHeight = Math.min(imgHeightPerPage, imgHeight - sourceY)
          
          // Créer un canvas temporaire pour cette portion
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imgWidth
          tempCanvas.height = sourceHeight
          const tempCtx = tempCanvas.getContext('2d')
          
          if (tempCtx) {
            // Copier la portion du canvas original
            tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
            const pageImgData = tempCanvas.toDataURL('image/png')
            
            // Calculer les dimensions pour cette page
            const pageImgWidthMM = availableWidth
            const pageImgHeightMM = (pageImgWidthMM * sourceHeight) / imgWidth
            
            // Ajouter l'image sur la page
            pdf.addImage(pageImgData, 'PNG', margin, headerHeight + margin, pageImgWidthMM, pageImgHeightMM)
          }
        }
      } else {
        // Une seule page suffit
        addHeader()
        pdf.addImage(imgData, 'PNG', margin, headerHeight + margin, imgWidthMM, imgHeightMM)
      }
      
      // Ajouter le footer sur chaque page
      const totalPages = (pdf as any).internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `MZ Energy - Simulation Photovoltaïque V4 - Page ${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // Télécharger le PDF
      const projectTitle = simulation.nom_projet || `Simulation #${simulation.id.slice(0, 8)}`
      const fileName = `MZ-Energy_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      
      console.log('Export PDF: Téléchargement du fichier:', fileName)
      pdf.save(fileName)
      console.log('Export PDF: Terminé avec succès!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur export PDF:', errorMessage, error)
      // S'assurer de restaurer l'affichage en cas d'erreur
      document.body.classList.remove('pdf-exporting')
      if (parentElement) {
        if (originalPaddingTop) {
          parentElement.style.paddingTop = originalPaddingTop
        } else {
          parentElement.style.paddingTop = ''
        }
      }
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button 
      onClick={handleExport}
      disabled={exporting}
      className="bg-solar-gradient hover:opacity-90 text-white gap-2"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Export...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  )
}

