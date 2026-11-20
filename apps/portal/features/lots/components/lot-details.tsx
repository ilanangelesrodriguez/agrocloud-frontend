"use client";

import Link from "next/link";
import { LoadingState, ErrorState, PageHeader, StatusBadge } from "@agrocloud/ui";

import { useLotDetails } from "../hooks";
import { LotManagement } from "@/features/agricultural/components/lot-management";
import { LotOperations } from "./lot-operations";
import { LotWorkflow } from "./lot-workflow";

export function LotDetails({
  id,
  stage = "overview",
}: {
  id: string;
  stage?: "overview" | "reception" | "sampling";
}) {
  const query = useLotDetails(id);
  if (query.isPending) return <LoadingState label="Cargando registro" />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => query.refetch()}
        actions={
          <Link
            href="/lots"
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
          >
            Volver a lotes
          </Link>
        }
      />
    );
  const lot = query.data.lot;
  const fields = [
    ["Código", lot.codigo_lote],
    ["Productor", lot.productor?.nombre_razon_social ?? String(lot.id_productor)],
    ["Producto", lot.producto],
    ["Variedad", lot.variedad],
    ["Peso", lot.peso_kg + " " + lot.unidad_medida],
    ["Estado", lot.estado.replaceAll("_", " ")],
    ["Llegada prevista", new Date(lot.fecha_llegada_prevista).toLocaleString("es-PE")],
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          stage === "reception"
            ? "Recepción del lote"
            : stage === "sampling"
              ? "Muestreo del lote"
              : "Detalle de lote"
        }
        description={`${lot.codigo_lote} · ${[lot.producto, lot.variedad].filter(Boolean).join(" · ")}`}
        actions={
          <Link
            href="/lots"
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
          >
            Volver a lotes
          </Link>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Lote en seguimiento
          </p>
          <p className="mt-1 text-lg font-semibold">{lot.codigo_lote}</p>
        </div>
        <StatusBadge tone={lot.estado === "RECIBIDO" ? "success" : "neutral"}>
          {lot.estado.replaceAll("_", " ")}
        </StatusBadge>
      </div>
      {stage === "overview" ? <LotWorkflow lot={lot} active={stage} /> : null}
      <nav
        aria-label="Vistas del lote"
        className="flex gap-2 overflow-x-auto border-b border-border pb-3"
      >
        {[
          ["overview", "Resumen", `/lots/${id}`],
          ["reception", "Recepción", `/lots/${id}/reception`],
          ["sampling", "Muestreo", `/lots/${id}/sampling`],
        ].map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
            aria-current={stage === key ? "page" : undefined}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${stage === key ? "bg-accent/10 text-accent" : "text-muted hover:bg-default"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {stage === "overview" ? (
        <>
          <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="break-words">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
      <LotOperations lot={lot} stage={stage} />
      {stage === "overview" ? <LotManagement lot={lot} /> : null}
    </div>
  );
}
