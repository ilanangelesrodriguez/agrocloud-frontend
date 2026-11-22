"use client";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, TextField, Label, TextArea, FieldError, Form } from "@heroui/react";
import { ErrorState, LoadingState, FormNotice, PagePagination, StatusBadge } from "@agrocloud/ui";
import type { Lot } from "@/features/lots/schema";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { bffRequest } from "@/lib/api/bff-client";
import { incidentsPage, cancelInput, cancelResponse } from "../operations-schema";
import { incidentLabels } from "@/features/incidents/schema";
import { IncidentEditor } from "./incident-editor";
export function LotManagement({
  lot,
  view = "all",
}: {
  lot: Lot;
  view?: "all" | "actions" | "incidents";
}) {
  const { data: actor } = useCurrentUser();
  const canRead = canManageCompany(actor, "incidencias.ver");
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
    enabled: canRead && view !== "actions",
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
      {view !== "incidents" &&
      lot.estado === "PENDIENTE_RECEPCION" &&
      !lot.recepcion &&
      !lot.muestreos?.length &&
      canManageCompany(actor, "lotes.eliminar") ? (
        <details className="rounded-card border border-border bg-surface p-5">
          <summary className="cursor-pointer font-semibold">Anular lote</summary>
          <Form validationBehavior="native" className="mt-4 space-y-3" onSubmit={submit}>
            <TextField variant="secondary" name="motivo" isRequired isDisabled={cancel.isPending}>
              <Label>Motivo de anulación</Label>
              <TextArea
                placeholder="Describe el motivo de esta acción"
                variant="secondary"
                maxLength={2000}
              />
              <FieldError />
            </TextField>
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
          </Form>
        </details>
      ) : null}
      {canRead && view !== "actions" ? (
        <section className="space-y-4 rounded-card border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Incidencias del lote</h2>
              <p className="mt-1 text-xs text-muted">
                {incidents.data?.data.length ?? 0} registradas en esta página
              </p>
            </div>
            {lot.estado !== "ANULADO" ? <IncidentEditor lotId={lot.id_lote} /> : null}
          </div>
          {incidents.isPending ? (
            <LoadingState label="Cargando incidencias" />
          ) : incidents.isError ? (
            <ErrorState error={incidents.error} retry={() => incidents.refetch()} />
          ) : (
            <div className="space-y-4">
              {incidents.data.data.length === 0 ? (
                <div className="rounded-xl bg-surface-secondary p-4">
                  <p className="text-sm font-medium">Sin incidencias registradas</p>
                  <p className="mt-1 text-sm text-muted">
                    No se han registrado incidencias en esta página del expediente.
                  </p>
                </div>
              ) : (
                incidents.data.data.map((item) => (
                  <article key={item.id} className="space-y-2 rounded-xl border border-border p-4">
                    <h3 className="font-semibold">{item.titulo}</h3>
                    <p>{item.descripcion}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        tone={
                          item.gravedad === "ALTA" || item.gravedad === "CRITICA"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {incidentLabels[item.gravedad]}
                      </StatusBadge>
                      <StatusBadge tone="neutral">{incidentLabels[item.estado]}</StatusBadge>
                      <span className="text-xs text-muted">Responsable #{item.responsable}</span>
                    </div>
                    <IncidentEditor incident={item} />
                  </article>
                ))
              )}
              {incidents.data.meta.last_page > 1 ? (
                <PagePagination
                  label="Paginación de incidencias"
                  page={page}
                  last={incidents.data.meta.last_page}
                  isDisabled={incidents.isFetching}
                  onChange={setPage}
                />
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
