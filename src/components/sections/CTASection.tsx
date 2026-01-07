'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calculator, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/layout/CallbackModal'
import { useState } from 'react'

interface CTASectionProps {
  title: string
  text: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    action: 'callback' | 'link'
    href?: string
  }
  backgroundImage?: string
}

export function CTASection({
  title,
  text,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
}: CTASectionProps) {
  const [callbackOpen, setCallbackOpen] = useState(false)

  return (
    <>
      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/70" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {title}
          </h2>
          <p className="text-lg text-white mb-8 drop-shadow-md" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
            {text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={primaryCTA.href}>
              <Button size="lg" className="bg-solar-gradient hover:opacity-90 text-white">
                <Calculator className="w-4 h-4 mr-2" />
                {primaryCTA.text}
              </Button>
            </Link>
            {secondaryCTA && (
              <>
                {secondaryCTA.action === 'callback' ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    onClick={() => setCallbackOpen(true)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {secondaryCTA.text}
                  </Button>
                ) : (
                  <Link href={secondaryCTA.href || '#'}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      {secondaryCTA.text}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <CallbackModal open={callbackOpen} onOpenChange={setCallbackOpen} />
    </>
  )
}

