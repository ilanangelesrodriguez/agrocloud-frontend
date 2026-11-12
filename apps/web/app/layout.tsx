import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { fontMono, fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const metadataBase = new URL(siteConfig.publicUrl || "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "AgroCloud AI | Calidad y trazabilidad agrícola",
    template: "%s | AgroCloud AI",
  },
  description: siteConfig.description,
  applicationName: "AgroCloud AI",
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "AgroCloud AI",
    title: "AgroCloud AI | Calidad y trazabilidad agrícola",
    description: siteConfig.description,
  },
  robots: { index: Boolean(siteConfig.publicUrl), follow: Boolean(siteConfig.publicUrl) },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
      lang="es-PE"
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <a className="site-skip" href="#contenido">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main className="min-h-[60vh]" id="contenido">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
