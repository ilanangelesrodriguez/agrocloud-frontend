"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";
import type { z } from "zod";
import type { IdentityUser } from "@/lib/auth/schemas";
import type { inspectionDetail } from "@/features/agricultural/inspection";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Checkbox,
  Label,
  TextArea,
  TextField,
  toast,
  FieldError,
  Form,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormNotice, InlineNotice, StatusBadge } from "@agrocloud/ui";
import { canManageCompany } from "@/features/company/navigation";
import { validateInspection } from "../review-api";
import { inspectionReviewStats, type ServerReviewProgress } from "../review-progress";
import { QualityDecisionForm } from "./quality-decision-form";

type Inspection = z.infer<typeof inspectionDetail>["data"];
export function InspectionClosure({
  inspection,
  actor,
  progress,
  view = "all",
  onRefresh,
  refreshing = false,
}: {
  inspection: Inspection;
  actor?: IdentityUser;
  progress?: ServerReviewProgress;
  view?: "all" | "validation" | "decision";
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const cache = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const stats = inspectionReviewStats(inspection, progress);
  const { ready } = stats;
  useEffect(() => {
    setConfirmed(false);
  }, [inspection.evidencias, inspection.hallazgos, progress]);
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
      {view !== "decision" ? (
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Validación de la inspección</h2>
            {onRefresh ? (
              <Button
                size="sm"
                variant="secondary"
                isPending={refreshing}
                isDisabled={validate.isPending}
                onPress={onRefresh}
              >
                Actualizar requisitos
              </Button>
            ) : null}
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ["Frutos cubiertos", `${stats.covered} de ${stats.total ?? "—"}`],
              [
                "Evidencias con revisión vigente",
                stats.reviewed === undefined
                  ? "Sin verificar"
                  : `${stats.reviewed} de ${stats.relevant}`,
              ],
              ["Estado", inspection.estado.replaceAll("_", " ")],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <ul
            className="space-y-2 rounded-xl bg-surface-secondary p-4 text-sm"
            aria-label="Requisitos de validación"
          >
            <li>
              {stats.verified &&
              stats.total !== undefined &&
              stats.total > 0 &&
              stats.covered === stats.total
                ? "✓"
                : "○"}{" "}
              Todos los frutos tienen evidencia pertinente ({stats.covered} de{" "}
              {stats.total ?? "sin total"})
            </li>
            <li>
              {stats.pending === 0 && stats.relevant > 0
                ? "✓ Revisión humana vigente de todas las evidencias"
                : stats.pending === undefined
                  ? "○ Vigencia de revisiones pendiente de verificar"
                  : "○ Faltan " + stats.pending + " evidencias por revisar o actualizar"}
            </li>
            <li>
              {progress?.ai_pending === 0 ? "✓" : "○"} Sin análisis IA pendientes o en proceso
            </li>
            <li>
              {inspection.estado === "VALIDADA"
                ? "✓ Inspección validada"
                : "○ Confirmar revisión completa y enviar a dictamen"}
            </li>
          </ul>
          {!stats.verified && inspection.estado === "EN_CAPTURA" ? (
            <InlineNotice
              status="warning"
              title="Progreso vigente no disponible"
              description="No se ha podido comprobar la vigencia de las revisiones para esta inspección. Actualiza el expediente. La validación se habilitará cuando el servicio confirme que la revisión está completa."
            />
          ) : null}
          <Link
            href={`/inspections/${inspection.id_inspeccion}/evidences#pending`}
            className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
          >
            Ir a evidencias pendientes →
          </Link>
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
            <Form
              validationBehavior="native"
              onSubmit={(event) => {
                event.preventDefault();
                if (ready && confirmed && !validate.isPending) validate.mutate();
              }}
              className="space-y-4"
            >
              <TextField
                variant="secondary"
                value={notes}
                onChange={setNotes}
                isDisabled={validate.isPending}
              >
                <Label>Observaciones de validación (opcional)</Label>
                <TextArea
                  placeholder="Ingresa observaciones de validación (opcional)"
                  variant="secondary"
                  maxLength={3000}
                  rows={3}
                />
                <FieldError />
              </TextField>
              <Checkbox
                isSelected={confirmed}
                onChange={setConfirmed}
                isDisabled={!ready || validate.isPending}
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
            </Form>
          ) : null}
        </section>
      ) : null}
      {view !== "validation" ? (
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Dictamen de calidad</h2>
          {decisions.length ? (
            <ol className="space-y-4">
              {decisions.map((item) => (
                <li
                  key={item.id_dictamen}
                  className="space-y-2 rounded-xl border border-border p-4"
                >
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
            <p className="text-sm text-muted">
              {inspection.estado === "VALIDADA"
                ? "Pendiente del dictamen de un supervisor autorizado."
                : "Pendiente de validación de la inspección. Una vez validada, un supervisor autorizado podrá registrar la decisión."}
            </p>
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
              El dictamen requiere una cuenta de supervisor con permiso de clasificación, diferente
              al inspector.
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
      ) : null}
    </div>
  );
}
