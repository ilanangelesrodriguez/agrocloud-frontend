"use client";

import Link from "next/link";
import { InlineNotice, StatusBadge } from "@agrocloud/ui";

import type { Lot } from "../schema";

/** No deduce inspecciones ni resultados IA del estado del lote: faltan esos datos en la respuesta. */
export function LotWorkflow({ lot, active }: { lot: Lot; active?: string }) {
  const received = Boolean(lot.recepcion);
  const sampled = Boolean(lot.muestreos?.length);
  const firstSample = lot.muestreos?.[0];
  const stages = [
    {
      name: "Recepción",
      done: received,
      description: "Registrar documento y peso recibido",
      href: `/lots/${lot.id_lote}/reception`,
      key: "reception",
      known: true,
    },
    {
      name: "Muestreo",
      done: sampled,
      description: "Aplicar el procedimiento autorizado",
      href: `/lots/${lot.id_lote}/sampling`,
      key: "sampling",
      known: true,
    },
    {
      name: "Inspección",
      done: false,
      description: "Consultar o iniciar desde el detalle del muestreo",
      href: firstSample ? `/samplings/${firstSample.id_muestreo}` : `/lots/${lot.id_lote}/sampling`,
      key: "inspection",
      known: false,
    },
    {
      name: "Evidencias",
      done: false,
      description: "Capturar fotografías desde la inspección",
      href: firstSample ? `/samplings/${firstSample.id_muestreo}` : `/lots/${lot.id_lote}/sampling`,
      key: "evidence",
      known: false,
    },
  ] as const;

  return (
    <section className="space-y-3" aria-label="Continuidad operativa del lote">
      <h2 className="text-lg font-semibold">Flujo de trabajo</h2>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, index) => (
          <li
            key={stage.name}
            className={`rounded-2xl border bg-surface p-4 ${active === stage.key ? "border-accent ring-1 ring-accent/20" : "border-border"}`}
          >
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
