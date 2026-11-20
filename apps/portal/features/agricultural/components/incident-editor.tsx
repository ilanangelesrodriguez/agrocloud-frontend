"use client";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  incidentInput,
  incidentUpdate,
  incidentResponse,
  type incidentRecord,
} from "../operations-schema";
const fieldClass = "min-h-11 w-full rounded-xl border border-border bg-surface p-3";
export function IncidentEditor({
  incident,
  lotId,
}: {
  incident?: z.infer<typeof incidentRecord>;
  lotId?: number;
}) {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const supervisor = actor?.rol?.codigo === "SUPERVISOR";
  const states = incident
    ? incident.estado === "ABIERTA"
      ? ["EN_ATENCION"]
      : incident.estado === "EN_ATENCION"
        ? ["RESUELTA"]
        : supervisor
          ? incident.estado === "RESUELTA"
            ? ["CERRADA", "EN_ATENCION"]
            : ["ABIERTA"]
          : []
    : [];
  const allowed = incident
    ? (supervisor || actor?.id_usuario === incident.responsable) && states.length > 0
    : ["ADMIN", "RECEPCION", "INSPECTOR", "SUPERVISOR"].includes(actor?.rol?.codigo ?? "");
  const save = useMutation({
    mutationFn: (body: object) =>
      bffRequest(
        incident ? `incidents/${incident.id}` : `lots/${lotId}/incidents`,
        incidentResponse,
        {
          method: incident ? "PATCH" : "POST",
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
    if (save.isPending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const parsed = incident
      ? incidentUpdate.safeParse({
          estado: value("estado"),
          accion: value("accion"),
          comprobacion: value("comprobacion") || undefined,
          evidencia: value("evidencia") ? Number(value("evidencia")) : undefined,
        })
      : incidentInput.safeParse({
          titulo: value("titulo"),
          descripcion: value("descripcion"),
          gravedad: value("gravedad"),
          responsable: Number(value("responsable")),
        });
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    if (parsed.success) save.mutate(parsed.data, { onSuccess: () => form.reset() });
  }
  if (!allowed) return null;
  return (
    <details className="rounded-xl border border-border p-4">
      <summary className="cursor-pointer font-medium">
        {incident ? "Actualizar seguimiento" : "Registrar incidencia"}
      </summary>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <fieldset disabled={save.isPending} className="grid gap-3 sm:grid-cols-2">
          {incident ? (
            <>
              <label>
                Estado
                <select name="estado" className={fieldClass}>
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label>
                Acción realizada
                <textarea name="accion" required maxLength={3000} className={fieldClass} />
              </label>
              <label>
                Comprobación para resolver o cerrar
                <textarea name="comprobacion" maxLength={1500} className={fieldClass} />
              </label>
              <label>
                ID de evidencia del lote (opcional)
                <input name="evidencia" type="number" min={1} className={fieldClass} />
              </label>
            </>
          ) : (
            <>
              <label>
                Título
                <input name="titulo" required maxLength={150} className={fieldClass} />
              </label>
              <label>
                Gravedad
                <select name="gravedad" className={fieldClass}>
                  {["BAJA", "MEDIA", "ALTA", "CRITICA"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Descripción
                <textarea name="descripcion" required maxLength={3000} className={fieldClass} />
              </label>
              <label>
                ID del responsable activo de tu empresa
                <input name="responsable" type="number" min={1} required className={fieldClass} />
              </label>
            </>
          )}
        </fieldset>
        {error || save.isError ? (
          <FormNotice
            message={
              error || (save.error instanceof Error ? save.error.message : "No se pudo guardar.")
            }
          />
        ) : null}
        {save.isSuccess ? <FormNotice success message="Incidencia guardada." /> : null}
        <Button type="submit" isPending={save.isPending}>
          Guardar
        </Button>
      </form>
    </details>
  );
}
