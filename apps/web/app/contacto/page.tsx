import type { Metadata } from "next";

import { ContactContent } from "@/components/marketing/contact-content";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Consulta cómo solicitar acceso empresarial a AgroCloud AI.",
  alternates: { canonical: "/contacto" },
};

export default function Page() {
  return <ContactContent />;
}
