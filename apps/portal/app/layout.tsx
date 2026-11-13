import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontMono, fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: { default: "AgroCloud AI | Portal", template: "%s | AgroCloud AI" },
  description: "Acceso seguro al portal empresarial de AgroCloud AI.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={clsx(fontSans.variable, fontMono.variable)}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
