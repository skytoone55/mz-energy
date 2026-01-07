'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileStickyCTA } from './MobileStickyCTA'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Ne pas afficher Header/Footer pour les routes dashboard et admin
  const isPrivateRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/login')
  
  if (isPrivateRoute) {
    return <>{children}</>
  }
  
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  )
}

