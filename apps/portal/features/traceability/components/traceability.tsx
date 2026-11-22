"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { EmptyState, LoadingState, ErrorState, PagePagination } from "@agrocloud/ui";

import { useLotTraceability } from "../hooks";

function displayDate(value: string | null | undefined): string {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Lima",
      });
}

function eventDetails(value: string | Record<string, unknown> | undefined) {
  const labels: Record<string, string> = {
    motivo: "Motivo",
    accion: "Acción",
    comprobacion: "Comprobación",
    observaciones: "Observaciones",
    decision: "Dictamen",
    documento: "Documento",
    transportista: "Transportista",
    placa: "Placa",
    peso_recibido_kg: "Peso recibido",
    gravedad: "Gravedad",
    titulo: "Título",
    estado: "Estado",
  };
  try {
    const changes: Record<string, unknown> =
      typeof value === "string" ? JSON.parse(value) : (value ?? {});
    return Object.entries(labels).flatMap(([key, label]) =>
      typeof changes[key] === "string" || typeof changes[key] === "number"
        ? [
            {
              label,
              value:
                String(changes[key]).replaceAll("_", " ") +
                (key === "peso_recibido_kg" ? " kg" : ""),
            },
          ]
        : [],
    );
  } catch {
    return [];
  }
}

function eventLabel(event: string) {
  const names: Record<string, string> = {
    LOTE_CREADO: "Lote creado",
    RECEPCION_CONFIRMADA: "Recepción confirmada",
    MUESTREO_CREADO: "Muestreo registrado",
    MUESTREO_REGISTRADO: "Muestreo registrado",
    INSPECCION_CREADA: "Inspección iniciada",
    INSPECCION_VALIDADA: "Inspección validada",
    LOTE_ANULADO: "Lote anulado",
    DICTAMEN_EMITIDO: "Dictamen emitido",
    INCIDENCIA_ABIERTA: "Incidencia registrada",
  };
  const text = event.replaceAll("_", " ").toLocaleLowerCase("es");
  return names[event] ?? text.charAt(0).toUpperCase() + text.slice(1);
}
export function Traceability({ id }: { id: number }) {
  const [page, setPage] = useState(1);
  const query = useLotTraceability(id, page);

  return (
    <section
      id="lot-traceability"
      className="scroll-mt-24 space-y-3 rounded-card border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Trazabilidad</h2>
        <Button
          size="sm"
          variant="secondary"
          isDisabled={query.isFetching}
          onPress={() => void query.refetch()}
        >
          {query.isFetching ? "Actualizando…" : "Actualizar eventos"}
        </Button>
      </div>
      <p className="text-sm text-muted">
        Historial de operaciones del lote. Fechas en hora de Perú.
      </p>
      {query.isPending ? (
        <LoadingState label="Cargando eventos" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div className="space-y-4">
          {query.data.data.length ? (
            <ol className="space-y-3 border-l-2 border-border pl-5">
              {query.data.data.map((item) => (
                <li key={item.id} className="relative space-y-1">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.7rem] top-1.5 size-2.5 rounded-full bg-accent"
                  />
                  <p className="font-medium">{eventLabel(item.evento)}</p>
                  <time className="text-xs text-muted" dateTime={item.created_at ?? undefined}>
                    {displayDate(item.created_at)}
                  </time>
                  {eventDetails(item.cambios).length ? (
                    <details className="pt-2">
                      <summary className="cursor-pointer text-sm font-medium text-accent">
                        Ver datos del evento
                      </summary>
                      <dl className="mt-3 grid gap-3 rounded-xl bg-surface-secondary p-4 sm:grid-cols-2">
                        {eventDetails(item.cambios).map((detail) => (
                          <div key={detail.label}>
                            <dt className="text-xs text-muted">{detail.label}</dt>
                            <dd className="mt-1 break-words text-sm">{detail.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="Sin eventos en esta página"
              description="Los nuevos eventos aparecerán cuando se registren operaciones."
            />
          )}
          {query.data.last_page > 1 ? (
            <PagePagination last={query.data.last_page} page={page} onChange={setPage} />
          ) : null}
        </div>
      )}
    </section>
  );
}
