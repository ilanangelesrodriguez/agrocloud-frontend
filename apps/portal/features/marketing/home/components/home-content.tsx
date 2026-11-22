"use client";

import Link from "next/link";
import { Alert, Card, Chip, Tabs, Typography } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
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
import { MarketingBackdrop } from "@/components/marketing/marketing/marketing-backdrop";
import { useMarketingAutoStep } from "@/components/marketing/use-marketing-auto-step";
import { useOnboardingAvailability } from "@/components/marketing/onboarding-availability";

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
  const {
    ref: autoStepRef,
    active,
    selectStep,
    reduceMotion,
  } = useMarketingAutoStep(stages.length);
  const onboardingAvailable = useOnboardingAvailability();

  return (
    <>
      <section className="site-hero-grid relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50/70 via-background to-background dark:from-brand-700/10">
        <MarketingBackdrop />
        <div className="site-container relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
          <Reveal className="relative z-10 space-y-6">
            <Eyebrow>Calidad agrícola · Trazabilidad · IA asistida</Eyebrow>
            <Typography.Heading
              className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.65rem]"
              level={1}
            >
              Del ingreso de la cosecha al <span className="text-accent">dictamen de calidad.</span>{" "}
              Todo conectado.
            </Typography.Heading>
            <Typography.Paragraph className="max-w-xl text-base leading-8 text-muted sm:text-lg">
              Organiza lotes, muestras, inspecciones y evidencias en un mismo flujo. Tu equipo
              mantiene el control de cada revisión y decisión.
            </Typography.Paragraph>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="site-button site-button-primary" href="/planes">
                Ver planes y comenzar
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link className="site-button site-button-outline" href="/como-funciona">
                Cómo funciona
                <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <p className="max-w-xl text-xs leading-6 text-muted">
              Elegir un plan no genera cobros. El registro empresarial requiere revisión y
              aprobación antes de activar una cuenta.
              {!onboardingAvailable
                ? " Las nuevas solicitudes están temporalmente deshabilitadas; puedes explorar las modalidades."
                : ""}
            </p>

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
            <div ref={autoStepRef}>
              <Card className="rounded-[2rem] border border-brand-600/20 bg-surface shadow-lg shadow-brand-700/10">
                <Card.Content className="p-4 sm:p-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-sm font-semibold text-accent">Expediente agrícola</span>
                    <Chip color="accent" size="sm" variant="soft">
                      Flujo automático
                    </Chip>
                  </div>
                  <Tabs
                    className="mt-4 space-y-4"
                    selectedKey={stages[active].n}
                    variant="secondary"
                    onSelectionChange={(key) => {
                      const index = stages.findIndex((stage) => stage.n === String(key));
                      if (index !== -1) selectStep(index);
                    }}
                  >
                    <Tabs.ListContainer className="max-w-full overflow-x-auto">
                      <Tabs.List
                        aria-label="Explorar etapas del proceso agrícola"
                        className="min-w-max"
                      >
                        {stages.map((stage) => (
                          <Tabs.Tab key={stage.n} id={stage.n}>
                            {stage.title}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                        ))}
                      </Tabs.List>
                    </Tabs.ListContainer>
                    {stages.map((stage) => {
                      const StageIcon = stage.icon;

                      return (
                        <Tabs.Panel key={stage.n} id={stage.n}>
                          <div className="min-h-52 rounded-2xl bg-gradient-to-br from-[#0F523C] to-[#103D35] p-5 text-white sm:p-6">
                            <AnimatePresence mode="wait" initial={false}>
                              {active === stages.indexOf(stage) ? (
                                <motion.div
                                  key={stage.n}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                                  initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="text-xs font-medium text-white/70">
                                      Etapa {stage.n} de 04
                                    </span>
                                    <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                                      <StageIcon
                                        aria-hidden="true"
                                        className="size-5 text-[#B7F5A2]"
                                      />
                                    </span>
                                  </div>
                                  <Typography.Paragraph className="mt-3 text-2xl font-semibold leading-tight text-white">
                                    {stage.title}
                                  </Typography.Paragraph>
                                  <Typography.Paragraph className="mt-2 max-w-md text-sm leading-7 text-white/80">
                                    {stage.detail}
                                  </Typography.Paragraph>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        </Tabs.Panel>
                      );
                    })}
                  </Tabs>
                  <div aria-hidden="true" className="mt-4 flex gap-1.5">
                    {stages.map((stage, index) => (
                      <span
                        key={stage.n}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-600/10"
                      >
                        <motion.span
                          animate={{ scaleX: index <= active ? 1 : 0 }}
                          className="block h-full origin-left rounded-full bg-brand-700"
                          initial={false}
                          transition={{ duration: reduceMotion ? 0 : 0.3 }}
                        />
                      </span>
                    ))}
                  </div>
                  <Typography.Paragraph className="mt-3 text-center text-[11px] text-muted">
                    Ejemplo ilustrativo: no representa datos reales ni reemplaza la revisión humana.
                  </Typography.Paragraph>
                </Card.Content>
              </Card>
            </div>
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

      <section className="landing-section border-b border-border bg-surface">
        <div className="site-container grid items-center gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-5">
            <SectionIntro
              eyebrow="Empieza con AgroCloud"
              text="Un único proceso de incorporación, tanto para comenzar gratis como para elegir una oferta de pago."
              title="De visitante a empresa activa en tres pasos"
            />
            <Link className="site-text-link" href="/planes">
              Comparar modalidades de acceso
              <FiArrowRight aria-hidden="true" className="size-4" />
            </Link>
            {!onboardingAvailable ? (
              <p className="text-sm leading-6 text-muted" role="status">
                La recepción de solicitudes todavía no está habilitada. Puedes consultar los planes
                y conocer el proceso mientras tanto.
              </p>
            ) : null}
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Elige y solicita",
                description: "Compara planes y envía los datos de tu empresa, sin pagar.",
              },
              {
                n: "02",
                title: "Revisión y activación",
                description: "Revisamos tu solicitud y, si se aprueba, activas tu cuenta.",
              },
              {
                n: "03",
                title: "Empieza a trabajar",
                description: "Usa Gratis o confirma una oferta vigente cuando decidas contratar.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-border bg-background p-4 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-brand-600/30 hover:shadow-sm motion-reduce:transition-none sm:p-5"
              >
                <span className="text-sm font-semibold tabular-nums text-accent">{step.n}</span>
                <Typography.Heading className="mt-3 text-base font-semibold" level={3}>
                  {step.title}
                </Typography.Heading>
                <Typography.Paragraph className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </Typography.Paragraph>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-section landing-section">
        <div className="site-container space-y-8">
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

      <section className="site-section landing-section border-y border-border bg-surface">
        <div className="site-container flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <SectionIntro
            eyebrow="Proceso agrícola"
            text="Desde la recepción y el muestreo hasta la inspección, las evidencias y el dictamen, cada registro conserva su contexto."
            title="Un mismo expediente, de origen a decisión"
          />
          <Link
            className="site-button site-button-outline shrink-0 self-start"
            href="/como-funciona"
          >
            Conocer el proceso completo
            <FiArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <section className="site-section landing-section">
        <div className="site-container grid items-center gap-10 lg:grid-cols-2">
          <div className="relative min-h-[260px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#103D35] to-[#0F523C] p-7 text-white shadow-lg shadow-brand-700/15 sm:min-h-[300px] sm:p-10">
            <span className="text-sm font-semibold text-[#A4E8C3]">Análisis de imágenes</span>
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-28 size-80 rounded-full border-[50px] border-white/5"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-16 size-64 rounded-full bg-[#B7F5A2]/10 blur-2xl"
            />
            <div className="relative mt-8 max-w-xs space-y-5">
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
          <Reveal viewport>
            <Faq />
          </Reveal>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
