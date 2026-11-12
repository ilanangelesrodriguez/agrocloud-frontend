import type { Metadata } from "next";

import { AccessRequestContent } from "@/features/access-requests/components/access-request-content";
import { getPrivacyVersion } from "@/lib/privacy-version";

export const metadata: Metadata = {
  title: "Solicitar acceso empresarial",
  description:
    "Solicita acceso a AgroCloud AI para tu empresa. Registro sujeto a revisión y aprobación.",
  alternates: { canonical: "/solicitar-acceso" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <AccessRequestContent privacyVersion={getPrivacyVersion()} />;
}
