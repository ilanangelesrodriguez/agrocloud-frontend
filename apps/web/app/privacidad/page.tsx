import type { Metadata } from "next";

import { PrivacyContent } from "@/features/access-requests/components/privacy-content";
import { getPrivacyVersion } from "@/lib/privacy-version";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Información sobre el tratamiento de datos en solicitudes de acceso de AgroCloud AI.",
  alternates: { canonical: "/privacidad" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <PrivacyContent privacyVersion={getPrivacyVersion()} />;
}
