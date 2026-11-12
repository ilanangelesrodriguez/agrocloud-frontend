import type { Metadata } from "next";

import { PlansContent } from "@/features/plans/components/plans-content";

export const metadata: Metadata = {
  title: "Planes y acceso",
  description:
    "Conoce las modalidades de incorporación a AgroCloud AI. Condiciones y precios sujetos a una oferta vigente.",
  alternates: { canonical: "/planes" },
};

export default function Page() {
  return <PlansContent />;
}
