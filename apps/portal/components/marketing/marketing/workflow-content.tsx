"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiUsers } from "react-icons/fi";

import { PageHero, CallToAction } from "@/components/marketing/marketing";
import { useMarketingAutoStep } from "@/components/marketing/use-marketing-auto-step";

type Step = { n: string; t: string; d: string; tag?: string };

const steps: Step[] = [
  {
    n: "01",
    t: "Identifica el origen",
    d: "Registra los datos del productor y crea el lote asociado.",
  },
  {
    n: "02",
    t: "Confirma la recepción",
    d: "Documenta el ingreso de la carga y el inicio de su recorrido operativo.",
  },
  {
    n: "03",
    t: "Organiza el muestreo",
    d: "Selecciona el procedimiento y registra las muestras que corresponden al lote.",
  },
  {
    n: "04",
    t: "Inspecciona y captura evidencias",
    d: "Relaciona observaciones, fotografías e incidencias con el expediente.",
  },
  {
    n: "05",
    t: "Revisa los resultados asistidos",
    d: "Cuando está disponible, la IA aporta detecciones que el inspector valida o descarta.",
    tag: "Asistido por IA",
  },
  {
    n: "06",
    t: "Emite el dictamen",
    d: "El personal autorizado revisa el expediente y documenta la decisión de calidad.",
    tag: "Validación humana",
  },
  {
    n: "07",
    t: "Consulta la trazabilidad",
    d: "Accede al historial y los registros vinculados a cada etapa.",
  },
];

const roles = ["Recepción", "Inspección", "Supervisión", "Producción", "Administración"];

export function WorkflowContent() {
  const { ref: autoStepRef, active, selectStep, reduceMotion } = useMarketingAutoStep(steps.length, 4800);
  const current = steps[active];

  return (
    <>
      <PageHero
        description="Cada etapa se relaciona con el expediente del lote. No necesitas perder el contexto entre registros, evidencias y revisiones."
        eyebrow="El proceso AgroCloud"
        title="Del origen al dictamen, paso a paso"
      />
      <section className="site-section site-section-first">
        <div className="site-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Recorrido del expediente
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Siete etapas, un mismo historial
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                Explora cada paso de forma interactiva mientras el recorrido avanza
                automáticamente.
              </p>
            </div>
          </div>

          <div ref={autoStepRef} className="grid gap-6 rounded-[2rem] border border-brand-600/15 bg-surface p-4 shadow-lg shadow-brand-700/5 sm:p-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-8 lg:p-8">
            <nav aria-label="Etapas del proceso" className="min-w-0">
              <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {steps.map((step, index) => {
                  const selected = active === index;
                  const completed = index < active;
                  return (
                    <li key={step.n}>
                      <button
                        aria-current={selected ? "step" : undefined}
                        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          selected
                            ? "border-brand-600/35 bg-brand-50/70 shadow-sm dark:bg-brand-700/20"
                            : "border-transparent hover:border-brand-600/20 hover:bg-surface-secondary"
                        }`}
                        type="button"
                        onClick={() => selectStep(index)}
                      >
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums transition-colors ${
                            selected
                              ? "bg-brand-700 text-white"
                              : completed
                                ? "bg-brand-600/15 text-accent"
                                : "bg-surface-secondary text-muted"
                          }`}
                        >
                          {completed ? <FiCheck aria-hidden="true" /> : step.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-semibold ${selected ? "text-accent" : "text-foreground"}`}
                          >
                            {step.t}
                          </span>
                        </span>
                        {selected ? (
                          <span aria-hidden="true" className="size-2 rounded-full bg-brand-600" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="flex min-h-[340px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#11553E] to-[#103D35] p-5 text-white sm:p-7 lg:min-h-[410px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium tracking-wide text-[#C5E8D8]">
                  ETAPA {current.n} DE 07
                </span>
                {current.tag ? (
                  <Chip color="accent" size="sm" variant="soft">
                    {current.tag}
                  </Chip>
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Proceso conectado
                  </span>
                )}
              </div>
              <div className="my-8 min-h-[150px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.n}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                    transition={{ duration: reduceMotion ? 0 : 0.28 }}
                  >
                    <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/10 text-[#B7F5A2]">
                      <FiCheck aria-hidden="true" className="size-6" />
                    </span>
                    <Typography.Heading
                      className="text-2xl font-semibold text-white sm:text-3xl"
                      level={3}
                    >
                      {current.t}
                    </Typography.Heading>
                    <Typography.Paragraph className="mt-4 max-w-lg text-sm leading-7 text-[#D4EDE2] sm:text-base">
                      {current.d}
                    </Typography.Paragraph>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="space-y-4">
                <div aria-hidden="true" className="flex gap-1.5">
                  {steps.map((step, index) => (
                    <span
                      key={step.n}
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
                    >
                      <motion.span
                        animate={{ scaleX: index <= active ? 1 : 0 }}
                        className="block h-full origin-left rounded-full bg-[#B7F5A2]"
                        initial={false}
                        transition={{ duration: reduceMotion ? 0 : 0.3 }}
                      />
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button
                    aria-label="Etapa anterior"
                    isDisabled={active === 0}
                    variant="secondary"
                    onPress={() => selectStep(active - 1)}
                  >
                    <FiArrowLeft aria-hidden="true" /> Anterior
                  </Button>
                  <span className="text-xs text-white/75" aria-live="polite">
                    {active + 1} de {steps.length}
                  </span>
                  <Button
                    aria-label="Etapa siguiente"
                    variant="secondary"
                    onPress={() => selectStep((active + 1) % steps.length)}
                  >
                    Siguiente <FiArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-12">
        <div className="site-container max-w-4xl rounded-2xl border border-brand-600/20 bg-background p-6 shadow-sm shadow-brand-700/5 sm:p-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-700/25 dark:text-brand-400"
            >
              <FiUsers className="size-5" />
            </span>
            <Typography.Heading className="text-xl font-semibold" level={2}>
              Roles y responsabilidades
            </Typography.Heading>
          </div>
          <Typography.Paragraph className="mt-4 text-sm leading-8 text-muted">
            Recepción, inspección, supervisión, producción y administración participan en diferentes
            etapas. La plataforma determina las operaciones disponibles según los permisos del
            usuario y su empresa.
          </Typography.Paragraph>
          <div aria-hidden="true" className="mt-5 flex flex-wrap gap-2">
            {roles.map((role) => (
              <Chip key={role} color="accent" size="sm" variant="soft">
                {role}
              </Chip>
            ))}
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
