import type { Metadata } from "next";

import { FiArchive, FiCamera, FiCheckCircle, FiClipboard, FiLayers, FiShield, FiTruck, FiUsers, FiFileText } from "react-icons/fi";

import { Reveal } from "@/components/marketing/reveal";

import {
  CallToAction,
  FeatureCard,
  PageHero,
  SectionIntro,
} from "@/components/marketing/marketing";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Conoce los módulos de AgroCloud para gestión de lotes, inspección y calidad agrícola.",
  alternates: { canonical: "/funcionalidades" },
};
const featureIcons = [FiUsers, FiArchive, FiTruck, FiLayers, FiClipboard, FiCamera, FiFileText, FiCheckCircle, FiShield];

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
        title="Toda tu operación agrícola, conectada"
      />
      <section className="site-section site-section-first">
        <div className="site-container space-y-9">
          <Reveal viewport>
            <div className="grid gap-4 rounded-2xl border border-brand-600/15 bg-gradient-to-r from-brand-50/70 via-surface to-surface p-5 shadow-sm shadow-brand-700/5 sm:grid-cols-3 sm:p-6 dark:from-brand-700/15">
              {[
                { title: "Información conectada", text: "Cada registro conserva su relación con el lote.", Icon: FiLayers },
                { title: "Evidencia revisable", text: "Fotografías y hallazgos al alcance del inspector.", Icon: FiCamera },
                { title: "Control por permisos", text: "Acceso delimitado según responsabilidades.", Icon: FiShield },
              ].map(({ title, text, Icon }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-accent">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <SectionIntro
            eyebrow="Qué puedes gestionar"
            text="Las funciones visibles dependen del perfil y los permisos de cada usuario."
            title="Módulos orientados al proceso agrícola"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map(([number, title, description, tag], index) => {
              const Icon = featureIcons[index] ?? FiLayers;
              return (
                <Reveal key={number} className="h-full" delay={Math.min(index % 3, 2) * 0.06} viewport>
                  <FeatureCard
                    description={description}
                    icon={<Icon aria-hidden="true" />}
                    tag={tag}
                    title={title}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
