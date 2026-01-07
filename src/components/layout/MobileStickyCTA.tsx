'use client'

import { useState } from 'react'
import { Calculator, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CallbackModal } from './CallbackModal'

export function MobileStickyCTA() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t shadow-lg">
        <div className="flex gap-2 p-3">
          <Link href="/simulation" className="flex-1">
            <Button className="w-full bg-solar-gradient hover:opacity-90 text-white gap-2">
              <Calculator className="w-4 h-4" />
              Simuler
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Phone className="w-4 h-4" />
            Être rappelé
          </Button>
        </div>
      </div>
      <CallbackModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

