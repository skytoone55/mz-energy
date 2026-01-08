import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { TranslationProvider } from "@/lib/translation/TranslationContext";
import { HtmlLangInit } from "@/components/layout/HtmlLangInit";
import { DEFAULT_LOCALE, getDirection } from "@/lib/translation/types";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MZ Energy - Solutions Solaires en Israël",
  description: "Solutions photovoltaïques clé en main en Israël. Produisez, stockez et revendez votre énergie solaire. Simulation gratuite.",
  keywords: ["photovoltaïque", "solaire", "Israël", "économies", "énergie", "panneaux solaires"],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MZ Energy',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Utiliser DEFAULT_LOCALE pour le SSR initial
  const defaultDirection = getDirection(DEFAULT_LOCALE);
  
  return (
    <html lang={DEFAULT_LOCALE} dir={defaultDirection} suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans`}>
        <HtmlLangInit />
        <TranslationProvider>
          <PublicLayout>
            {children}
          </PublicLayout>
        </TranslationProvider>
      </body>
    </html>
  );
}
