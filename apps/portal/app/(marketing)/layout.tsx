import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { OnboardingAvailabilityProvider } from "@/components/marketing/onboarding-availability";
import { isPublicOnboardingEnabled } from "@/lib/marketing/onboarding";
import { getPrivacyVersion } from "@/lib/marketing/privacy-version";
import { siteConfig } from "@/config/marketing/site";

export const metadata: Metadata = {
  title: {
    default: "AgroCloud AI | Calidad y trazabilidad agrícola",
    template: "%s | AgroCloud AI",
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "AgroCloud AI",
    title: "AgroCloud AI | Calidad y trazabilidad agrícola",
    description: siteConfig.description,
    images: [{ url: "/agrocloud/avocado-orchard.png", alt: "Cultivo de palta — AgroCloud AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroCloud AI | Calidad y trazabilidad agrícola",
    description: siteConfig.description,
    images: ["/agrocloud/avocado-orchard.png"],
  },
  robots: { index: Boolean(siteConfig.publicUrl), follow: Boolean(siteConfig.publicUrl) },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const onboardingAvailable = isPublicOnboardingEnabled() && Boolean(getPrivacyVersion());

  return (
    <OnboardingAvailabilityProvider enabled={onboardingAvailable}>
      <a className="site-skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main className="min-h-[60vh]" id="contenido">
        {children}
      </main>
      <SiteFooter />
    </OnboardingAvailabilityProvider>
  );
}
