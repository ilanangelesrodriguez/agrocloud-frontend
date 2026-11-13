"use client";

import { useState } from "react";
import { EmptyState, LoadingState, ErrorState, PagePagination } from "@agrocloud/ui";

import { useLotTraceability } from "../hooks";

export function Traceability({ id }: { id: number }) {
  const [page, setPage] = useState(1);
  const query = useLotTraceability(id, page);

  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Trazabilidad</h2>
      {query.isPending ? (
        <LoadingState label="Cargando eventos" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <>
          {query.data.data.length ? (
            <ul className="space-y-2">
              {query.data.data.map((item) => (
                <li key={item.id}>
                  {item.evento.replaceAll("_", " ")}
                  {item.created_at ? " · " + item.created_at : ""}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Sin eventos en esta página"
              description="Cuando se registren eventos de trazabilidad aparecerán aquí."
            />
          )}
          <PagePagination last={query.data.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
