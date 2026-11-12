import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction, Eyebrow, FeatureCard, SectionIntro } from "@/components/marketing";
import { Reveal } from "@/components/reveal";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "Calidad y trazabilidad agrícola en una plataforma",
  alternates: { canonical: "/" },
};

const stages = [
  { n: "01", title: "Recepción", text: "Registra el ingreso del lote y su origen." },
  { n: "02", title: "Muestreo", text: "Documenta la selección y las muestras." },
  { n: "03", title: "Inspección", text: "Vincula fotografías, hallazgos y revisión." },
  { n: "04", title: "Dictamen", text: "Conserva decisiones y trazabilidad." },
];
export default function Home() {
  return (
    <>
      <section className="site-hero-grid relative overflow-hidden border-b border-border">
        <div className="site-container relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-28">
          <Reveal className="relative z-10 space-y-6">
            <Eyebrow>Calidad agrícola · Trazabilidad · IA asistida</Eyebrow>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.65rem]">
              Del ingreso de la palta al <span className="text-accent">dictamen de calidad.</span>{" "}
              Todo conectado.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted sm:text-lg">
              Organiza lotes, muestras, inspecciones y evidencias en un mismo flujo. Tu equipo
              mantiene el control de cada revisión y decisión.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/solicitar-acceso" className="site-button site-button-primary">
                Solicitar acceso empresarial <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/funcionalidades" className="site-button site-button-outline">
                Conocer funcionalidades <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-muted">
              {["Trazabilidad por lote", "Evidencia vinculada", "Acceso por funciones"].map((x) => (
                <span key={x} className="inline-flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  {x}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12} className="relative z-10">
            <div className="relative rounded-[2rem] border border-brand-600/20 bg-surface p-4 shadow-2xl shadow-brand-700/10 sm:p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-[.17em] text-accent">
                  Expediente agrícola
                </span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-700/15 dark:text-brand-400">
                  Flujo ilustrativo
                </span>
              </div>
              <div className="my-5 rounded-2xl bg-[#0F523C] p-5 text-white sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-white/70">
                    Un lote, una historia completa
                  </span>
                  <span aria-hidden="true" className="text-3xl">
                    ✦
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold leading-tight">
                  Cada etapa con su contexto.
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Origen, evidencias y decisiones relacionados en un solo recorrido.
                </p>
                <div aria-hidden="true" className="mt-6 flex items-center gap-1.5">
                  {stages.map((stage, index) => (
                    <div
                      key={stage.n}
                      className={`h-1.5 flex-1 rounded-full ${index === 3 ? "bg-[#B7F5A2]" : "bg-white/55"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {stages.map((stage, index) => (
                  <div
                    key={stage.n}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-3.5"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl font-mono text-xs font-semibold ${index === 3 ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400"}`}
                    >
                      {stage.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{stage.title}</p>
                      <p className="text-xs text-muted">{stage.text}</p>
                    </div>
                    <span aria-hidden="true" className="text-accent">
                      ✓
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] text-muted">
                Ejemplo visual del proceso; no representa datos operativos reales.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container space-y-10">
          <SectionIntro
            eyebrow="Una plataforma, más claridad"
            title="El contexto correcto para cada decisión"
            text="La operación agrícola involucra información dispersa. AgroCloud conecta cada registro con la siguiente etapa para facilitar el seguimiento."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Lotes con origen identificado"
              description="Relaciona productores, lotes y recepciones para consultar la procedencia y el avance operativo."
              tag="Operación"
            />
            <FeatureCard
              number="02"
              title="Evidencias vinculadas"
              description="Mantén fotografías e incidencias relacionadas con la inspección, el fruto y su expediente."
              tag="Inspección"
            />
            <FeatureCard
              number="03"
              title="Decisiones documentadas"
              description="Apoya la revisión humana y conserva el historial necesario para evaluar la calidad del lote."
              tag="Control de calidad"
            />
          </div>
        </div>
      </section>

      <section className="site-section border-y border-border bg-surface">
        <div className="site-container grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Cómo funciona"
              title="Cuatro etapas. Un mismo expediente."
              text="Sigue el recorrido de un lote desde la recepción hasta el dictamen. Cada etapa conserva su relación con las anteriores."
            />
            <Link href="/como-funciona" className="site-text-link">
              Explorar el proceso <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stages.map((x) => (
              <div className="rounded-2xl border border-border bg-background p-5" key={x.n}>
                <span className="font-mono text-sm font-semibold text-accent">{x.n}</span>
                <h3 className="mt-4 font-semibold">{x.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-[#103D35] p-7 text-white sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#A4E8C3]">
              Análisis de imágenes
            </span>
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-28 size-80 rounded-full border-[50px] border-white/5"
            />
            <div className="relative mt-12 max-w-xs space-y-5">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                ⌕
              </div>
              <p className="text-2xl font-semibold leading-snug">
                La tecnología aporta información. Tu equipo conserva el criterio.
              </p>
              <p className="text-sm leading-6 text-[#D3EDE2]">
                Las detecciones son indicios para revisar, no un dictamen automático.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <SectionIntro
              eyebrow="Inteligencia artificial responsable"
              title="La IA acompaña. La validación humana decide."
              text="Las fotografías pueden analizarse mediante un servicio de detección. Los resultados deben revisarse por personal autorizado antes de incorporarse a una decisión de calidad."
            />
            <div className="rounded-xl border border-warning/25 bg-warning-soft/40 p-4 text-sm leading-7 text-foreground">
              <strong>Alcance del modelo:</strong> la disponibilidad y las categorías detectables
              dependen de la versión y configuración del servicio. No se garantiza un diagnóstico
              completo ni precisión comercial sin evaluación.
            </div>
          </div>
        </div>
      </section>

      <section className="site-section border-t border-border bg-surface">
        <div className="site-container grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <SectionIntro
            eyebrow="Preguntas frecuentes"
            title="Respuestas antes de comenzar"
            text="Conoce el alcance de la plataforma y cómo solicitar acceso empresarial."
          />
          <Faq />
        </div>
      </section>
      <CallToAction />
    </>
  );
}
