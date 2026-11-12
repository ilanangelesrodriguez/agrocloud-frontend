import type { Metadata } from "next";
import { PageHero, SectionIntro, CallToAction, FeatureCard } from "@/components/marketing";
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
        eyebrow="Sobre AgroCloud"
        title="Tecnología enfocada en decisiones agrícolas trazables"
        description="AgroCloud AI es una plataforma diseñada para organizar el recorrido de los lotes y relacionar los registros de calidad con las personas responsables de cada etapa."
      />
      <section className="site-section">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <SectionIntro
            eyebrow="Propósito"
            title="Información conectada, trabajo más claro"
            text="Buscamos que el equipo pueda consultar el contexto de cada lote sin depender de registros dispersos. Desde el origen hasta las evidencias y decisiones, la información se organiza por etapa y responsabilidad."
          />
          <div className="grid gap-4">
            <FeatureCard
              number="01"
              title="Trazabilidad"
              description="Mantener el historial de lo ocurrido en cada lote y su proceso de calidad."
            />
            <FeatureCard
              number="02"
              title="Responsabilidad"
              description="Registrar las revisiones y decisiones mediante perfiles y permisos definidos."
            />
            <FeatureCard
              number="03"
              title="IA como apoyo"
              description="Usar análisis de imágenes sin reemplazar el criterio de un inspector o supervisor."
            />
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
