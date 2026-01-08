'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { T } from '@/components/T'

interface FAQItem {
  question: string | React.ReactNode
  answer: string | React.ReactNode
}

interface FAQProps {
  items: FAQItem[]
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <button
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="font-semibold">{typeof item.question === 'string' ? <T>{item.question}</T> : item.question}</span>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                openIndex === index && 'transform rotate-180'
              )}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-secondary/30 border-t">
              <p className="text-muted-foreground">{typeof item.answer === 'string' ? <T>{item.answer}</T> : item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

