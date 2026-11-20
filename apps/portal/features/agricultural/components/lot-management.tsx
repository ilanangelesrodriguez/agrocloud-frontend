"use client";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { ErrorState, LoadingState, FormNotice } from "@agrocloud/ui";
import type { Lot } from "@/features/lots/schema";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { bffRequest } from "@/lib/api/bff-client";
import { incidentsPage, cancelInput, cancelResponse } from "../operations-schema";
import { IncidentEditor } from "./incident-editor";
export function LotManagement({ lot }: { lot: Lot }) {
  const { data: actor } = useCurrentUser();
  const canRead = canManageCompany(actor, "lotes.ver");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const cache = useQueryClient();
  const incidents = useQuery({
    queryKey: ["agricultural", "incidents", lot.id_lote, page],
    queryFn: ({ signal }) =>
      bffRequest(
        `lots/${lot.id_lote}/incidents?page=${page}`,
        incidentsPage,
        { signal },
        "agricultural",
      ),
    enabled: canRead,
  });
  const cancel = useMutation({
    mutationFn: (body: object) =>
      bffRequest(
        `lots/${lot.id_lote}/cancel`,
        cancelResponse,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        },
        "agricultural",
      ),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ["agricultural"] });
    },
    retry: false,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cancel.isPending) return;
    const parsed = cancelInput.safeParse({
      motivo: new FormData(event.currentTarget).get("motivo"),
    });
    setError(parsed.success ? "" : "Indica un motivo de hasta 2000 caracteres.");
    if (parsed.success) cancel.mutate(parsed.data);
  }
  return (
    <div className="space-y-5">
      {lot.estado === "PENDIENTE_RECEPCION" &&
      !lot.recepcion &&
      !lot.muestreos?.length &&
      canManageCompany(actor, "lotes.eliminar") ? (
        <details className="rounded-card border border-border bg-surface p-5">
          <summary className="cursor-pointer font-semibold">Anular lote</summary>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <label className="block">
              Motivo de anulación
              <textarea
                name="motivo"
                required
                maxLength={2000}
                disabled={cancel.isPending}
                className="mt-2 w-full rounded-xl border border-border bg-surface p-3"
              />
            </label>
            <p className="text-sm text-muted">
              La anulación cierra este lote e impide continuar su recepción.
            </p>
            {error || cancel.isError ? (
              <FormNotice
                message={
                  error ||
                  (cancel.error instanceof Error ? cancel.error.message : "No se pudo anular.")
                }
              />
            ) : null}
            <Button type="submit" isPending={cancel.isPending}>
              Confirmar anulación
            </Button>
          </form>
        </details>
      ) : null}
      {canRead ? (
        <section className="space-y-4 rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">Incidencias</h2>
          {incidents.isPending ? (
            <LoadingState label="Cargando incidencias" />
          ) : incidents.isError ? (
            <ErrorState error={incidents.error} retry={() => incidents.refetch()} />
          ) : (
            <>
              {incidents.data.data.length === 0 ? (
                <p className="text-muted">Sin incidencias registradas.</p>
              ) : (
                incidents.data.data.map((item) => (
                  <article key={item.id} className="space-y-2 rounded-xl border border-border p-4">
                    <h3 className="font-semibold">{item.titulo}</h3>
                    <p>{item.descripcion}</p>
                    <p className="text-sm text-muted">
                      {item.gravedad} · {item.estado} · Responsable #{item.responsable}
                    </p>
                    <IncidentEditor incident={item} />
                  </article>
                ))
              )}
              <nav aria-label="Paginación de incidencias" className="flex items-center gap-3">
                <Button
                  isDisabled={page <= 1 || incidents.isFetching}
                  onPress={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {page} de {incidents.data.meta.last_page}
                </span>
                <Button
                  isDisabled={page >= incidents.data.meta.last_page || incidents.isFetching}
                  onPress={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </nav>
            </>
          )}
          {lot.estado !== "ANULADO" ? <IncidentEditor lotId={lot.id_lote} /> : null}
        </section>
      ) : null}
    </div>
  );
}
