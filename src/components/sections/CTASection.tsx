'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calculator, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/layout/CallbackModal'
import { useState } from 'react'
import { T } from '@/components/T'

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
  secondaryVariant?: 'outline' | 'green' | 'orange'
  backgroundImage?: string
}

export function CTASection({
  title,
  text,
  primaryCTA,
  secondaryCTA,
  secondaryVariant = 'outline',
  backgroundImage,
}: CTASectionProps) {
  const [callbackOpen, setCallbackOpen] = useState(false)

  return (
    <>
      <section
        className="relative py-10 px-4 sm:px-6 lg:px-8"
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
          <div className="absolute inset-0 bg-white/90" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            <T>{title}</T>
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            <T>{text}</T>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={primaryCTA.href}>
              <Button size="lg" className="bg-solar-gradient hover:brightness-110 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-300 text-white text-lg px-8 py-6">
                <Calculator className="w-5 h-5 mr-2" />
                <T>{primaryCTA.text}</T>
              </Button>
            </Link>
            {secondaryCTA && (
              <>
                {secondaryCTA.action === 'callback' ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className={
                      secondaryVariant === 'green'
                        ? 'bg-green-600 hover:bg-green-500 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-105 transition-all duration-300 text-white border-0 text-lg px-8 py-6 cursor-pointer'
                        : secondaryVariant === 'orange'
                        ? 'bg-solar-gradient hover:brightness-110 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-300 text-white border-0 text-lg px-8 py-6 cursor-pointer'
                        : 'bg-black/5 border-gray-900/20 text-gray-900 hover:bg-white hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 text-lg px-8 py-6 cursor-pointer'
                    }
                    onClick={() => setCallbackOpen(true)}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    <T>{secondaryCTA.text}</T>
                  </Button>
                ) : (
                  <Link href={secondaryCTA.href || '#'}>
                    <Button
                      size="lg"
                      variant="outline"
                      className={
                        secondaryVariant === 'green'
                          ? 'bg-green-600 hover:bg-green-500 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-105 transition-all duration-300 text-white border-0 text-lg px-8 py-6 cursor-pointer'
                          : secondaryVariant === 'orange'
                          ? 'bg-solar-gradient hover:brightness-110 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-300 text-white border-0 text-lg px-8 py-6 cursor-pointer'
                          : 'bg-black/5 border-gray-900/20 text-gray-900 hover:bg-white hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 text-lg px-8 py-6 cursor-pointer'
                      }
                    >
                      <T>{secondaryCTA.text}</T>
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

