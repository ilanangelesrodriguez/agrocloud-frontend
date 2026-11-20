"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";
import type { z } from "zod";
import type { IdentityUser } from "@/lib/auth/schemas";
import type { inspectionDetail } from "@/features/agricultural/inspection";
import { useState } from "react";
import Link from "next/link";
import { Button, Checkbox, Label, TextArea, TextField, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormNotice, InlineNotice, StatusBadge } from "@agrocloud/ui";
import { canManageCompany } from "@/features/company/navigation";
import { validateInspection } from "../review-api";
import { QualityDecisionForm } from "./quality-decision-form";

type Inspection = z.infer<typeof inspectionDetail>["data"];
export function InspectionClosure({
  inspection,
  actor,
}: {
  inspection: Inspection;
  actor?: IdentityUser;
}) {
  const cache = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const photos = inspection.evidencias?.filter((item) => item.pertinencia !== "INVALIDA") ?? [];
  const reviewed = photos.filter(
    (item) =>
      item.pertinencia === "VALIDA" &&
      item.reviewed_at &&
      !["EN_COLA", "PROCESANDO"].includes(item.estado_ia ?? ""),
  );
  const covered = new Set(photos.map((item) => item.id_fruto)).size;
  const total = inspection.muestreo?.tamano_muestra;
  const ready =
    photos.length > 0 &&
    reviewed.length === photos.length &&
    total !== undefined &&
    covered >= total;
  const canValidate =
    actor?.rol?.codigo === "INSPECTOR" &&
    canManageCompany(actor, "inspecciones.validar") &&
    inspection.estado === "EN_CAPTURA" &&
    (inspection.id_inspector == null || inspection.id_inspector === actor?.id_usuario);
  const canDecide =
    actor?.rol?.codigo === "SUPERVISOR" &&
    canManageCompany(actor, "calidad.clasificar") &&
    inspection.id_inspector !== actor?.id_usuario;
  const refresh = () => invalidateOperationalQueries(cache, { notifications: true });
  const validate = useMutation({
    mutationFn: () =>
      validateInspection(String(inspection.id_inspeccion), { observaciones: notes.trim() || null }),
    retry: false,
    onSuccess: async () => {
      await refresh();
      setConfirmed(false);
      toast.success("Inspección validada y enviada a dictamen");
    },
  });
  const decisions = [...(inspection.dictamenes ?? [])].sort(
    (a, b) => b.id_dictamen - a.id_dictamen,
  );
  const latest = decisions[0];
  const replaceable =
    !latest ||
    (latest.decision === "OBSERVADO" &&
      ["DOCUMENTACION", "CORRECCION_ADMINISTRATIVA"].includes(latest.tipo_observacion ?? ""));
  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Validación de la inspección</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            ["Frutos con evidencia", `${covered} / ${total ?? "—"}`],
            ["Evidencias revisadas", `${reviewed.length} / ${photos.length}`],
            ["Estado", inspection.estado.replaceAll("_", " ")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {inspection.estado === "EN_CAPTURA" ? (
          <InlineNotice
            status={ready ? "success" : "warning"}
            title={
              ready
                ? "La revisión puede enviarse a validación"
                : "Completa la revisión de evidencias"
            }
            description="Cada fruto necesita una evidencia pertinente. Todas las evidencias no descartadas deben tener sus detecciones decididas y su revisión humana guardada."
          />
        ) : (
          <InlineNotice
            status="success"
            title="Inspección validada"
            description="La revisión humana está registrada. El dictamen corresponde a un supervisor independiente."
          />
        )}
        {canValidate ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (ready && confirmed && !validate.isPending) validate.mutate();
            }}
            className="space-y-4"
          >
            <TextField value={notes} onChange={setNotes} isDisabled={validate.isPending}>
              <Label>Observaciones de validación (opcional)</Label>
              <TextArea maxLength={3000} rows={3} />
            </TextField>
            <Checkbox
              isSelected={confirmed}
              onChange={setConfirmed}
              isDisabled={validate.isPending}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>Confirmo la revisión completa de los frutos y sus evidencias.</Label>
              </Checkbox.Content>
            </Checkbox>
            <Button
              type="submit"
              variant="primary"
              isDisabled={!ready || !confirmed || validate.isPending}
            >
              {validate.isPending ? "Validando…" : "Validar y enviar a dictamen"}
            </Button>
            {validate.error ? <FormNotice message={validate.error.message} /> : null}
          </form>
        ) : null}
      </section>
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Dictamen de calidad</h2>
        {decisions.length ? (
          <ol className="space-y-4">
            {decisions.map((item) => (
              <li key={item.id_dictamen} className="space-y-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge
                    tone={
                      item.decision === "APROBADO"
                        ? "success"
                        : item.decision === "RECHAZADO"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {item.decision}
                  </StatusBadge>
                  <span className="text-xs text-muted">
                    Dictamen #{item.id_dictamen}
                    {latest?.id_dictamen === item.id_dictamen ? " · Más reciente" : ""}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm">{item.observaciones}</p>
                <p className="text-xs text-muted">
                  {[
                    item.categoria,
                    item.motivo,
                    item.tipo_observacion?.replaceAll("_", " "),
                    item.protocolo_calidad,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {item.respuesta_observacion ? (
                  <p className="text-sm text-muted">Respuesta: {item.respuesta_observacion}</p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">Todavía no se ha emitido un dictamen.</p>
        )}
        {canDecide && inspection.estado === "VALIDADA" && replaceable ? (
          <QualityDecisionForm
            key={latest?.id_dictamen ?? "initial"}
            inspectionId={String(inspection.id_inspeccion)}
            previous={latest}
            onSaved={refresh}
          />
        ) : inspection.estado !== "VALIDADA" ? (
          <p className="text-sm text-muted">
            La inspección debe validarse antes de emitir el dictamen.
          </p>
        ) : latest && !replaceable ? (
          <InlineNotice
            status="accent"
            title={
              latest.tipo_observacion === "REINSPECCION"
                ? "Reinspección solicitada"
                : "Dictamen final registrado"
            }
            description={
              latest.tipo_observacion === "REINSPECCION"
                ? "Se ha creado una nueva inspección en el muestreo. El inspector debe continuar allí."
                : "La decisión final ya está registrada y no puede sobrescribirse."
            }
          />
        ) : (
          <p className="text-sm text-muted">
            El dictamen requiere una cuenta de supervisor con permiso de clasificación, diferente al
            inspector.
          </p>
        )}
        {latest?.tipo_observacion === "REINSPECCION" ? (
          <Link
            href={`/samplings/${inspection.id_muestreo}`}
            className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
          >
            Abrir muestreo y nueva inspección
          </Link>
        ) : null}
      </section>
    </div>
  );
}
