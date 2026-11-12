import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { fontMono, fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "./providers";

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
      className={`${fontSans.variable} ${fontMono.variable}`}
      lang="es-PE"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <a href="#contenido" className="site-skip">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main id="contenido" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
