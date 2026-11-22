import type { Metadata } from "next";

import { AccessRequestContent } from "@/features/marketing/access-requests/components/access-request-content";
import { isPublicOnboardingEnabled } from "@/lib/marketing/onboarding";
import { getPrivacyVersion } from "@/lib/marketing/privacy-version";

export const metadata: Metadata = {
  title: "Solicitar acceso empresarial",
  description: "Solicita acceso a AgroCloud AI para tu empresa. Registro sujeto a revisión.",
  alternates: { canonical: "/solicitar-acceso" },
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string | string[] }>;
}) {
  const { offer } = await searchParams;
  return (
    <AccessRequestContent
      selectedOfferKey={typeof offer === "string" ? offer : undefined}
      privacyVersion={isPublicOnboardingEnabled() ? getPrivacyVersion() : undefined}
    />
  );
}
