import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "MZ Energy - Simulateur Photovoltaïque Israël",
  description: "Calculez vos économies d'énergie avec une installation solaire. Simulation gratuite et personnalisée pour le marché israélien.",
  keywords: ["photovoltaïque", "solaire", "Israël", "économies", "énergie", "panneaux solaires"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
