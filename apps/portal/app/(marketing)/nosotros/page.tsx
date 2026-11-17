import type { Metadata } from "next";

import {
  PageHero,
  SectionIntro,
  CallToAction,
  FeatureCard,
} from "@/components/marketing/marketing";
export const metadata: Metadata = {
  title: "Sobre AgroCloud",
  description:
    "Conoce el propósito de AgroCloud AI y su enfoque en calidad y trazabilidad agrícola.",
  alternates: { canonical: "/nosotros" },
};
export default function AboutPage() {
  return (
    <>
      <PageHero
        description="AgroCloud AI es una plataforma diseñada para organizar el recorrido de los lotes y relacionar los registros de calidad con las personas responsables de cada etapa."
        eyebrow="Sobre AgroCloud"
        title="Tecnología enfocada en decisiones agrícolas trazables"
      />
      <section className="site-section">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <SectionIntro
            eyebrow="Propósito"
            text="Buscamos que el equipo pueda consultar el contexto de cada lote sin depender de registros dispersos. Desde el origen hasta las evidencias y decisiones, la información se organiza por etapa y responsabilidad."
            title="Información conectada, trabajo más claro"
          />
          <div className="grid gap-4">
            <FeatureCard
              description="Mantener el historial de lo ocurrido en cada lote y su proceso de calidad."
              number="01"
              title="Trazabilidad"
            />
            <FeatureCard
              description="Registrar las revisiones y decisiones mediante perfiles y permisos definidos."
              number="02"
              title="Responsabilidad"
            />
            <FeatureCard
              description="Usar análisis de imágenes sin reemplazar el criterio de un inspector o supervisor."
              number="03"
              title="IA como apoyo"
            />
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
