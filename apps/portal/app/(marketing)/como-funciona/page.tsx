import type { Metadata } from "next";

import { WorkflowContent } from "@/components/marketing/marketing/workflow-content";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Descubre el recorrido del lote agrícola en AgroCloud: registro, recepción, muestreo, inspección, validación y dictamen.",
  alternates: { canonical: "/como-funciona" },
};

export default function Page() {
  return <WorkflowContent />;
}
