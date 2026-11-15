"use client";

import { Chip, Typography } from "@heroui/react";
import { FiUsers } from "react-icons/fi";

import { PageHero, CallToAction } from "@/components/marketing";

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
  return (
    <>
      <PageHero
        description="Cada etapa se relaciona con el expediente del lote. No necesitas perder el contexto entre registros, evidencias y revisiones."
        eyebrow="El proceso AgroCloud"
        title="Un recorrido claro desde el origen hasta la decisión"
      />
      <section className="site-section">
        <div className="site-container max-w-4xl">
          <ol aria-label="Etapas del recorrido del lote">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;

              return (
                <li key={step.n} className="flex items-stretch gap-4 sm:gap-6">
                  {/* Columna izquierda: número + línea que lo une con el siguiente paso.
                      La línea sale del mismo eje que el número, así siempre queda centrada. */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-[#0F523C] font-mono text-sm font-semibold text-white shadow-lg shadow-brand-700/20 sm:size-14">
                      {step.n}
                    </div>
                    {!isLast ? (
                      <span aria-hidden="true" className="my-2 w-px flex-1 bg-brand-600/25" />
                    ) : null}
                  </div>

                  <div
                    className={`site-card min-w-0 flex-1 p-5 transition-colors hover:border-brand-600/40 sm:p-6 ${
                      isLast ? "" : "mb-4"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Typography.Heading className="text-lg font-semibold sm:text-xl" level={2}>
                        {step.t}
                      </Typography.Heading>
                      {step.tag ? (
                        <Chip color="accent" size="sm" variant="soft">
                          {step.tag}
                        </Chip>
                      ) : null}
                    </div>
                    <Typography.Paragraph className="mt-2 text-sm leading-7 text-muted">
                      {step.d}
                    </Typography.Paragraph>
                  </div>
                </li>
              );
            })}
          </ol>
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
