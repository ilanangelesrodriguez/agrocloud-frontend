import type { Metadata } from "next";

import { TermsContent } from "@/components/marketing/terms-content";

export const metadata: Metadata = {
  title: "Términos del servicio",
  description: "Condiciones generales informativas de acceso a AgroCloud AI.",
  alternates: { canonical: "/terminos" },
};

export default function Page() {
  return <TermsContent />;
}
