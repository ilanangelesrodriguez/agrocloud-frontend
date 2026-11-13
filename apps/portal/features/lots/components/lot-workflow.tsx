"use client";

import Link from "next/link";
import { InlineNotice, StatusBadge } from "@agrocloud/ui";

import type { Lot } from "../schema";

/** No deduce inspecciones ni resultados IA del estado del lote: faltan esos datos en la respuesta. */
export function LotWorkflow({ lot }: { lot: Lot }) {
  const received = Boolean(lot.recepcion);
  const sampled = Boolean(lot.muestreos?.length);
  const firstSample = lot.muestreos?.[0];
  const stages = [
    {
      name: "Recepción",
      done: received,
      description: "Registrar documento y peso recibido",
      href: "#lot-reception",
      known: true,
    },
    {
      name: "Muestreo",
      done: sampled,
      description: "Aplicar el procedimiento autorizado",
      href: firstSample ? `/samplings/${firstSample.id_muestreo}` : "#lot-sampling",
      known: true,
    },
    {
      name: "Inspección",
      done: false,
      description: "Consultar o iniciar desde el detalle del muestreo",
      href: firstSample ? `/samplings/${firstSample.id_muestreo}` : "#lot-sampling",
      known: false,
    },
    {
      name: "Evidencias",
      done: false,
      description: "Capturar fotografías desde la inspección",
      href: firstSample ? `/samplings/${firstSample.id_muestreo}` : "#lot-sampling",
      known: false,
    },
  ] as const;

  return (
    <section className="space-y-3" aria-label="Continuidad operativa del lote">
      <h2 className="text-lg font-semibold">Flujo de trabajo</h2>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, index) => (
          <li key={stage.name} className="rounded-card border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {index + 1}. {stage.name}
              </p>
              <StatusBadge tone={stage.done ? "success" : "neutral"}>
                {stage.done ? "Registrado" : stage.known ? "Pendiente" : "Consultar"}
              </StatusBadge>
            </div>
            <p className="mt-2 text-sm text-muted">{stage.description}</p>
            <Link
              className="mt-3 inline-block text-sm font-medium text-accent underline"
              href={stage.href}
            >
              {stage.done ? "Ver detalle" : "Ir al paso"}
            </Link>
          </li>
        ))}
      </ol>
      <InlineNotice
        status="accent"
        title={
          received
            ? sampled
              ? "Continuar la inspección"
              : "El lote está listo para muestreo"
            : "El lote requiere recepción"
        }
        description={
          received
            ? sampled
              ? "Abre el muestreo asociado para continuar la inspección y gestionar las evidencias."
              : "El personal con permiso de muestreo puede registrar el siguiente paso."
            : "Una cuenta autorizada de recepción debe confirmar el ingreso antes del muestreo."
        }
      />
    </section>
  );
}
