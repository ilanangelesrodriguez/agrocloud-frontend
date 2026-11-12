import type { Metadata } from "next";

import { CallToAction, FeatureCard, PageHero, SectionIntro } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Conoce los módulos de AgroCloud para gestión de lotes, inspección y calidad agrícola.",
  alternates: { canonical: "/funcionalidades" },
};
const items = [
  [
    "01",
    "Productores",
    "Consulta y organiza los datos de los productores vinculados a la operación agrícola.",
    "Origen",
  ],
  [
    "02",
    "Lotes",
    "Registra y realiza seguimiento a cada lote, su identificación y su relación con el productor.",
    "Operaciones",
  ],
  [
    "03",
    "Recepciones",
    "Documenta el ingreso del lote y los datos asociados al proceso de recepción.",
    "Operaciones",
  ],
  [
    "04",
    "Muestreos",
    "Organiza los procedimientos de muestreo y las muestras identificadas por lote.",
    "Control",
  ],
  [
    "05",
    "Inspecciones",
    "Registra la evaluación y sus evidencias para el seguimiento del inspector.",
    "Calidad",
  ],
  [
    "06",
    "IA y validación",
    "Revisa detecciones como apoyo técnico, validando o descartando los hallazgos.",
    "Asistido",
  ],
  [
    "07",
    "Dictámenes",
    "Conserva la decisión de calidad y el contexto registrado por el equipo responsable.",
    "Calidad",
  ],
  [
    "08",
    "Trazabilidad",
    "Consulta el recorrido y los eventos del lote a lo largo de la operación.",
    "Seguimiento",
  ],
  [
    "09",
    "Usuarios y permisos",
    "Organiza responsabilidades mediante funciones y permisos asignados por empresa.",
    "Administración",
  ],
];

export default function FunctionalitiesPage() {
  return (
    <>
      <PageHero
        description="AgroCloud reúne los registros necesarios para seguir un lote desde su origen hasta la decisión final de calidad."
        eyebrow="Funcionalidades"
        title="Toda la operación, con información conectada"
      />
      <section className="site-section">
        <div className="site-container space-y-10">
          <SectionIntro
            eyebrow="Qué puedes gestionar"
            text="Las funciones visibles dependen del perfil y los permisos de cada usuario."
            title="Módulos orientados al proceso agrícola"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map(([number, title, description, tag]) => (
              <FeatureCard
                key={number}
                description={description}
                number={number}
                tag={tag}
                title={title}
              />
            ))}
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
