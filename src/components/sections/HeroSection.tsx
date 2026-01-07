'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/layout/CallbackModal'
import { useState } from 'react'

interface HeroSectionProps {
  title: string
  subtitle?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    action: 'callback' | 'link'
    href?: string
  }
  backgroundImage?: string
  showScrollIndicator?: boolean
}

export function HeroSection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  showScrollIndicator = false,
}: HeroSectionProps) {
  const [callbackOpen, setCallbackOpen] = useState(false)

  return (
    <>
      <section
        className="relative min-h-[90vh] flex items-center justify-center"
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
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              {subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryCTA && (
              <Link href={primaryCTA.href}>
                <Button size="lg" className="bg-solar-gradient hover:opacity-90 text-white">
                  {primaryCTA.text}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            {secondaryCTA && (
              <>
                {secondaryCTA.action === 'callback' ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    onClick={() => setCallbackOpen(true)}
                  >
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
          {showScrollIndicator && (
            <div className="mt-12 flex justify-center">
              <a href="#content" className="animate-bounce">
                <ChevronDown className="w-6 h-6 text-white" />
              </a>
            </div>
          )}
        </div>
      </section>
      <CallbackModal open={callbackOpen} onOpenChange={setCallbackOpen} />
    </>
  )
}

