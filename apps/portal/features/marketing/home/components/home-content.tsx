"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Card, Chip, Typography } from "@heroui/react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCamera,
  FiCheck,
  FiClipboard,
  FiFileText,
  FiPackage,
  FiSearch,
  FiShield,
} from "react-icons/fi";

import { Faq } from "@/components/marketing/faq";
import { CallToAction, Eyebrow, FeatureCard, SectionIntro } from "@/components/marketing/marketing";
import { Reveal } from "@/components/marketing/reveal";

const stages = [
  {
    n: "01",
    title: "Recepción",
    text: "Registra el ingreso del lote y su origen.",
    detail: "Productor, fecha, peso y procedencia quedan asociados al lote desde el primer minuto.",
    icon: FiPackage,
  },
  {
    n: "02",
    title: "Muestreo",
    text: "Documenta la selección y las muestras.",
    detail: "Cada muestra se vincula al lote para saber qué se revisó y bajo qué criterio.",
    icon: FiClipboard,
  },
  {
    n: "03",
    title: "Inspección",
    text: "Vincula fotografías, hallazgos y revisión.",
    detail: "Las fotos y hallazgos se guardan junto al fruto inspeccionado, listos para revisión.",
    icon: FiCamera,
  },
  {
    n: "04",
    title: "Dictamen",
    text: "Conserva decisiones y trazabilidad.",
    detail: "La decisión final queda registrada con su historial completo y su responsable.",
    icon: FiFileText,
  },
];

const benefits = ["Trazabilidad por lote", "Evidencia vinculada", "Acceso por funciones"];

const highlights = [
  { icon: FiPackage, label: "Lotes", text: "con origen identificado" },
  { icon: FiCamera, label: "Evidencias", text: "ligadas a cada fruto" },
  { icon: FiShield, label: "Roles", text: "con acceso controlado" },
];

export function HomeContent() {
  const [active, setActive] = useState(0);
  const current = stages[active];
  const CurrentIcon = current.icon;

  return (
    <>
      <section className="site-hero-grid relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50/70 via-background to-background dark:from-brand-700/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand-600/10 blur-3xl"
        />
        <div className="site-container relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-28">
          <Reveal className="relative z-10 space-y-6">
            <Eyebrow>Calidad agrícola · Trazabilidad · IA asistida</Eyebrow>
            <Typography.Heading
              className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.65rem]"
              level={1}
            >
              Del ingreso de la palta al <span className="text-accent">dictamen de calidad.</span>{" "}
              Todo conectado.
            </Typography.Heading>
            <Typography.Paragraph className="max-w-xl text-base leading-8 text-muted sm:text-lg">
              Organiza lotes, muestras, inspecciones y evidencias en un mismo flujo. Tu equipo
              mantiene el control de cada revisión y decisión.
            </Typography.Paragraph>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="site-button site-button-primary" href="/solicitar-acceso">
                Solicitar acceso empresarial
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link className="site-button site-button-outline" href="/funcionalidades">
                Conocer funcionalidades
                <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {benefits.map((benefit) => (
                <Chip key={benefit} color="accent" size="sm" variant="soft">
                  <FiCheck aria-hidden="true" className="size-3.5" />
                  {benefit}
                </Chip>
              ))}
            </div>
          </Reveal>

          <Reveal className="relative z-10" delay={0.12}>
            <Card className="rounded-[2rem] border border-brand-600/20 bg-surface shadow-2xl shadow-brand-700/15">
              <Card.Content className="p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-sm font-semibold text-accent">Expediente agrícola</span>
                  <Chip color="accent" size="sm" variant="soft">
                    Flujo ilustrativo
                  </Chip>
                </div>

                {/* Panel que cambia según la etapa elegida */}
                <div className="my-5 rounded-2xl bg-gradient-to-br from-[#0F523C] to-[#103D35] p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-white/70">
                      Etapa {current.n} de 04
                    </span>
                    <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                      <CurrentIcon aria-hidden="true" className="size-5 text-[#B7F5A2]" />
                    </span>
                  </div>
                  <Typography.Paragraph className="mt-3 text-2xl font-semibold leading-tight text-white">
                    {current.title}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    aria-live="polite"
                    className="mt-2 min-h-[3.5rem] text-sm leading-6 text-white/80"
                  >
                    {current.detail}
                  </Typography.Paragraph>
                  <div aria-hidden="true" className="mt-5 flex items-center gap-1.5">
                    {stages.map((stage, index) => (
                      <div
                        key={stage.n}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          index <= active ? "bg-[#B7F5A2]" : "bg-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-2.5">
                  {stages.map((stage, index) => {
                    const selected = index === active;

                    return (
                      <button
                        key={stage.n}
                        aria-pressed={selected}
                        className={`flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          selected
                            ? "border-brand-600/50 bg-brand-50 shadow-sm dark:bg-brand-700/15"
                            : "border-border bg-background hover:border-brand-600/30 hover:bg-brand-50/50 dark:hover:bg-brand-700/10"
                        }`}
                        type="button"
                        onClick={() => setActive(index)}
                        onFocus={() => setActive(index)}
                        onMouseEnter={() => setActive(index)}
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl font-mono text-xs font-semibold transition-colors ${
                            selected
                              ? "bg-brand-700 text-white"
                              : "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400"
                          }`}
                        >
                          {stage.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground">
                            {stage.title}
                          </span>
                          <span className="block text-xs text-muted">{stage.text}</span>
                        </span>
                        <FiCheck
                          aria-hidden="true"
                          className={`size-4 text-accent transition-opacity ${
                            selected ? "opacity-100" : "opacity-30"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <Typography.Paragraph className="mt-4 text-center text-[11px] text-muted">
                  Ejemplo visual del proceso; no representa datos operativos reales.
                </Typography.Paragraph>
              </Card.Content>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Franja de valor rápido */}
      <section className="border-b border-border bg-brand-50/60 dark:bg-brand-700/10">
        <div className="site-container grid gap-4 py-6 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label, text }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">{label}</span> {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-section">
        <div className="site-container space-y-10">
          <SectionIntro
            eyebrow="Una plataforma, más claridad"
            text="La operación agrícola involucra información dispersa. AgroCloud conecta cada registro con la siguiente etapa para facilitar el seguimiento."
            title="El contexto correcto para cada decisión"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              description="Relaciona productores, lotes y recepciones para consultar la procedencia y el avance operativo."
              number="01"
              tag="Operación"
              title="Lotes con origen identificado"
            />
            <FeatureCard
              description="Mantén fotografías e incidencias relacionadas con la inspección, el fruto y su expediente."
              number="02"
              tag="Inspección"
              title="Evidencias vinculadas"
            />
            <FeatureCard
              description="Apoya la revisión humana y conserva el historial necesario para evaluar la calidad del lote."
              number="03"
              tag="Control de calidad"
              title="Decisiones documentadas"
            />
          </div>
        </div>
      </section>

      <section className="site-section border-y border-border bg-surface">
        <div className="site-container grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Cómo funciona"
              text="Sigue el recorrido de un lote desde la recepción hasta el dictamen. Cada etapa conserva su relación con las anteriores."
              title="Cuatro etapas. Un mismo expediente."
            />
            <Link className="site-text-link" href="/como-funciona">
              Explorar el proceso
              <FiArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stages.map((stage) => (
              <Card
                key={stage.n}
                className="border border-border bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-lg hover:shadow-brand-700/10"
              >
                <Card.Content className="p-5">
                  <span className="font-mono text-sm font-semibold text-accent">{stage.n}</span>
                  <Typography.Heading className="mt-4 font-semibold" level={3}>
                    {stage.title}
                  </Typography.Heading>
                  <Typography.Paragraph className="mt-2 text-sm leading-6 text-muted">
                    {stage.text}
                  </Typography.Paragraph>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#103D35] to-[#0F523C] p-7 text-white shadow-xl shadow-brand-700/20 sm:p-10">
            <span className="text-sm font-semibold text-[#A4E8C3]">Análisis de imágenes</span>
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-28 size-80 rounded-full border-[50px] border-white/5"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-16 size-64 rounded-full bg-[#B7F5A2]/10 blur-2xl"
            />
            <div className="relative mt-12 max-w-xs space-y-5">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-[#B7F5A2]/30">
                <FiSearch aria-hidden="true" className="size-8 text-[#B7F5A2]" />
              </span>
              <Typography.Paragraph className="text-2xl font-semibold leading-snug text-white">
                La tecnología aporta información. Tu equipo conserva el criterio.
              </Typography.Paragraph>
              <Typography.Paragraph className="text-sm leading-6 text-[#D3EDE2]">
                Las detecciones son indicios para revisar, no un dictamen automático.
              </Typography.Paragraph>
            </div>
          </div>

          <div className="space-y-5">
            <SectionIntro
              eyebrow="Inteligencia artificial responsable"
              text="Las fotografías pueden analizarse mediante un servicio de detección. Los resultados deben revisarse por personal autorizado antes de incorporarse a una decisión de calidad."
              title="La IA acompaña. La validación humana decide."
            />
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Alcance del modelo</Alert.Title>
                <Alert.Description>
                  La disponibilidad y las categorías detectables dependen de la versión y
                  configuración del servicio. No se garantiza un diagnóstico completo ni precisión
                  comercial sin evaluación.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </div>
        </div>
      </section>

      <section className="site-section border-t border-border bg-surface">
        <div className="site-container grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <SectionIntro
            eyebrow="Preguntas frecuentes"
            text="Conoce el alcance de la plataforma y cómo solicitar acceso empresarial."
            title="Respuestas antes de comenzar"
          />
          <Faq />
        </div>
      </section>

      <CallToAction />
    </>
  );
}
