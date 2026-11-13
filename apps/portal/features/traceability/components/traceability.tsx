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
    : date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
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
        Eventos recibidos desde el servicio agrícola para este lote.
      </p>
      {query.isPending ? (
        <LoadingState label="Cargando eventos" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.data.length ? (
            <ol className="space-y-3 border-l-2 border-border pl-5">
              {query.data.data.map((item) => (
                <li key={item.id} className="relative space-y-1">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.7rem] top-1.5 size-2.5 rounded-full bg-accent"
                  />
                  <p className="font-medium">{item.evento.replaceAll("_", " ")}</p>
                  <time className="text-xs text-muted" dateTime={item.created_at ?? undefined}>
                    {displayDate(item.created_at)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="Sin eventos en esta página"
              description="Los nuevos eventos aparecerán cuando se registren operaciones."
            />
          )}
          <PagePagination last={query.data.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
