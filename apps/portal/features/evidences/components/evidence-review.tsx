"use client";
import type { z } from "zod";
import { useState } from "react";
import { Button, Checkbox, Input, Label, TextArea, TextField, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  InlineNotice,
  LoadingState,
  PagePagination,
  StatusBadge,
} from "@agrocloud/ui";
import type {
  evidence,
  manualFinding,
  aiDetection,
  detectionValidation,
} from "@/features/agricultural/inspection";
import {
  decideDetection,
  reviewPhoto,
  discardPhoto,
  cancelPhotoAnalysis,
  addFinding,
} from "@/features/inspections/review-api";
import {
  findingInput,
  findingNatures,
  reasonInput,
  reviewInput,
} from "@/features/inspections/review-schema";
import { useMasterCatalog } from "@/features/company/agricultural/hooks";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";

type Photo = z.infer<typeof evidence>;
type Finding = z.infer<typeof manualFinding>;
export function EvidenceReview({
  inspectionId,
  photo,
  findings,
  canReview,
  canAnalyze,
}: {
  inspectionId: string;
  photo: Photo;
  findings: Finding[];
  canReview: boolean;
  canAnalyze: boolean;
}) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [justification, setJustification] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const refresh = () =>
    cache.invalidateQueries({ queryKey: ["agricultural", "inspections", "detail", inspectionId] });
  const update = useMutation({
    mutationFn: ({ action, input }: { action: "review" | "discard" | "cancel"; input: object }) =>
      action === "review"
        ? reviewPhoto(photo.id_evidencia, input)
        : action === "discard"
          ? discardPhoto(photo.id_evidencia, input)
          : cancelPhotoAnalysis(photo.id_evidencia, input),
    retry: false,
    onSuccess: async () => {
      await refresh();
      setConfirmed(false);
      setReason("");
      toast.success("Evidencia actualizada");
    },
  });
  const detections = photo.resultado_ia?.detections ?? [];
  const validations = photo.validaciones ?? [];
  const validationByIndex = new Map(validations.map((item) => [item.indice_deteccion, item]));
  const pending = detections.filter((_, index) => !validationByIndex.has(index)).length;
  const inProgress = ["EN_COLA", "PROCESANDO"].includes(photo.estado_ia ?? "");
  const discarded = photo.pertinencia === "INVALIDA";
  const cancelled = photo.error_ia === "Analysis cancelled; manual review requires justification.";
  const cancellable = !cancelled && ["EN_COLA", "ERROR"].includes(photo.estado_ia ?? "");
  const ownFindings = findings.filter((item) => item.id_evidencia === photo.id_evidencia);
  function act(action: "review" | "discard" | "cancel") {
    if (update.isPending) return;
    const input =
      action === "review"
        ? reviewInput.safeParse({
            revision_completa: confirmed,
            imagen_pertinente: confirmed,
            justificacion: justification.trim() || null,
          })
        : reasonInput.safeParse({ motivo: reason });
    if (action === "review" && photo.estado_ia !== "COMPLETADO" && !justification.trim()) {
      setError("Justifica la revisión manual cuando el análisis IA no está completado.");
      return;
    }
    setError(input.success ? "" : (input.error.issues[0]?.message ?? "Revisa los datos."));
    if (input.success) update.mutate({ action, input: input.data });
  }
  return (
    <section className="space-y-5 border-t border-border pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Revisión humana</h3>
        <StatusBadge tone={discarded ? "danger" : photo.reviewed_at ? "success" : "warning"}>
          {discarded ? "Descartada" : photo.reviewed_at ? "Revisada" : "Pendiente de revisión"}
        </StatusBadge>
      </div>
      {photo.version_modelo || photo.resultado_ia?.model_id ? (
        <p className="break-words text-xs text-muted">
          Modelo: {photo.version_modelo || photo.resultado_ia?.model_id}
        </p>
      ) : null}
      {inProgress ? (
        <InlineNotice
          status="accent"
          title={photo.estado_ia === "PROCESANDO" ? "Análisis en proceso" : "Análisis en cola"}
          description="El estado se actualiza automáticamente. La revisión estará disponible al finalizar el análisis."
        />
      ) : photo.estado_ia === "ERROR" ? (
        <InlineNotice
          status="warning"
          title={cancelled ? "Análisis cancelado" : "El análisis no se completó"}
          description="Puedes reintentar el análisis o realizar una revisión manual con justificación."
        />
      ) : null}
      {photo.estado_ia === "COMPLETADO" && !discarded ? (
        <>
          <p className="text-sm text-muted">
            {detections.length} detecciones · {pending} pendientes de decisión. Confirma cada
            hallazgo o recházalo si no corresponde.
          </p>
          {detections.length ? (
            <div className="space-y-3">
              {detections.slice((page - 1) * 10, page * 10).map((item, offset) => {
                const index = (page - 1) * 10 + offset;
                return (
                  <DetectionDecision
                    key={item.id}
                    detection={item}
                    index={index}
                    photoId={photo.id_evidencia}
                    validation={validationByIndex.get(index)}
                    canReview={canReview && !update.isPending}
                    refresh={refresh}
                  />
                );
              })}
              <PagePagination
                page={page}
                last={Math.max(1, Math.ceil(detections.length / 10))}
                onChange={setPage}
              />
            </div>
          ) : (
            <EmptyState
              title="La IA no detectó hallazgos"
              description="Revisa la imagen. Puedes registrar un hallazgo manual antes de confirmar tu revisión."
            />
          )}
        </>
      ) : null}
      <div className="space-y-3">
        <h4 className="font-semibold">Hallazgos manuales de esta imagen</h4>
        {ownFindings.length ? (
          <ul className="space-y-2">
            {ownFindings.map((item) => (
              <li key={item.id_hallazgo} className="rounded-xl bg-default p-4">
                <p className="text-sm font-semibold">
                  {item.clase} · {item.naturaleza.replaceAll("_", " ")}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted">
                  {item.observaciones}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Sin hallazgos manuales registrados.</p>
        )}
      </div>
      {canReview && !discarded && !inProgress ? (
        <>
          <ManualFindingForm
            inspectionId={inspectionId}
            photoId={photo.id_evidencia}
            refresh={refresh}
          />
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h4 className="font-semibold">Confirmar revisión de evidencia</h4>
            <TextField
              value={justification}
              onChange={setJustification}
              isRequired={photo.estado_ia !== "COMPLETADO"}
              isDisabled={update.isPending}
            >
              <Label>
                Justificación{" "}
                {photo.estado_ia === "COMPLETADO" ? "(opcional)" : "de revisión manual"}
              </Label>
              <TextArea rows={3} maxLength={2000} />
            </TextField>
            <Checkbox isSelected={confirmed} onChange={setConfirmed} isDisabled={update.isPending}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>
                  Revisé todas las detecciones y confirmo que la imagen corresponde al fruto.
                </Label>
              </Checkbox.Content>
            </Checkbox>
            <Button
              variant="primary"
              isDisabled={!confirmed || pending > 0 || update.isPending}
              onPress={() => act("review")}
            >
              Guardar revisión humana
            </Button>
          </div>
        </>
      ) : null}
      {!discarded && ((canReview && !inProgress) || (canAnalyze && cancellable)) ? (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <TextField value={reason} onChange={setReason} isDisabled={update.isPending}>
            <Label>Motivo para descartar o cancelar</Label>
            <TextArea rows={2} maxLength={2000} />
          </TextField>
          <div className="flex flex-wrap gap-2">
            {canReview && !inProgress ? (
              <Button
                variant="danger"
                isDisabled={!reason.trim() || update.isPending}
                onPress={() => act("discard")}
              >
                Descartar evidencia
              </Button>
            ) : null}
            {canAnalyze && cancellable ? (
              <Button
                variant="secondary"
                isDisabled={!reason.trim() || update.isPending}
                onPress={() => act("cancel")}
              >
                Cancelar análisis pendiente
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted">
            Un análisis que ya está procesándose no puede cancelarse.
          </p>
        </div>
      ) : null}
      {error || update.error ? <FormNotice message={error || update.error?.message} /> : null}
    </section>
  );
}

function DetectionDecision({
  detection,
  index,
  photoId,
  validation,
  canReview,
  refresh,
}: {
  detection: z.infer<typeof aiDetection>;
  index: number;
  photoId: number;
  validation?: z.infer<typeof detectionValidation>;
  canReview: boolean;
  refresh: () => Promise<unknown>;
}) {
  const [notes, setNotes] = useState(validation?.observaciones ?? "");
  const save = useMutation({
    mutationFn: (confirmada: boolean) =>
      decideDetection(photoId, index, { confirmada, observaciones: notes.trim() || null }),
    retry: false,
    onSuccess: async () => {
      await refresh();
      toast.success("Decisión de detección guardada");
    },
  });
  return (
    <article className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">
          {index + 1}. {detection.class_name}
        </h4>
        <StatusBadge
          tone={validation ? (validation.confirmada ? "success" : "neutral") : "warning"}
        >
          {validation ? (validation.confirmada ? "Confirmada" : "Rechazada") : "Sin decidir"}
        </StatusBadge>
      </div>
      <p className="text-xs text-muted">
        Confianza IA: {(detection.confidence * 100).toFixed(1)} % · Región ({detection.box.x1},{" "}
        {detection.box.y1})–({detection.box.x2}, {detection.box.y2})
      </p>
      {canReview ? (
        <>
          <TextField value={notes} onChange={setNotes} isDisabled={save.isPending}>
            <Label>Observaciones (opcional)</Label>
            <Input maxLength={2000} />
          </TextField>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              isDisabled={save.isPending}
              onPress={() => save.mutate(true)}
            >
              Confirmar hallazgo
            </Button>
            <Button
              size="sm"
              variant="tertiary"
              isDisabled={save.isPending}
              onPress={() => save.mutate(false)}
            >
              Rechazar detección
            </Button>
          </div>
        </>
      ) : validation?.observaciones ? (
        <p className="text-sm text-muted">{validation.observaciones}</p>
      ) : null}
      {save.error ? <FormNotice message={save.error.message} /> : null}
    </article>
  );
}

function ManualFindingForm({
  inspectionId,
  photoId,
  refresh,
}: {
  inspectionId: string;
  photoId: number;
  refresh: () => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("");
  const [nature, setNature] = useState<string>("DEFECTO_FISICO");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const catalog = useMasterCatalog("defecto", open);
  const save = useMutation({
    mutationFn: (input: z.infer<typeof findingInput>) => addFinding(inspectionId, input),
    retry: false,
    onSuccess: async () => {
      await refresh();
      setOpen(false);
      setNotes("");
      toast.success("Hallazgo registrado");
    },
  });
  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <Button
        variant="secondary"
        aria-expanded={open}
        isDisabled={save.isPending}
        onPress={() => setOpen(!open)}
      >
        {open ? "Cerrar registro de hallazgo" : "Agregar hallazgo manual"}
      </Button>
      {open ? (
        catalog.isPending ? (
          <LoadingState label="Cargando defectos" />
        ) : catalog.isError ? (
          <ErrorState error={catalog.error} retry={() => catalog.refetch()} />
        ) : (
          <div className="space-y-4">
            {!catalog.data?.data.length ? (
              <InlineNotice
                status="warning"
                title="Faltan defectos en maestros"
                description="Solicita al administrador registrar los defectos aplicables a este producto."
              />
            ) : null}
            <CatalogSelect
              label="Defecto observado"
              value={kind}
              onChange={setKind}
              disabled={save.isPending}
              items={(catalog.data?.data ?? []).map((item) => ({
                id: item.nombre,
                name: item.nombre,
              }))}
            />
            <CatalogSelect
              label="Naturaleza del hallazgo"
              value={nature}
              onChange={setNature}
              disabled={save.isPending}
              items={findingNatures.map((value) => ({
                id: value,
                name: value.replaceAll("_", " "),
              }))}
            />
            <TextField value={notes} onChange={setNotes} isDisabled={save.isPending}>
              <Label>Descripción y justificación</Label>
              <TextArea rows={3} maxLength={2000} />
            </TextField>
            <Button
              variant="primary"
              isDisabled={save.isPending || !kind}
              onPress={() => {
                const parsed = findingInput.safeParse({
                  id_evidencia: photoId,
                  clase: kind,
                  naturaleza: nature,
                  observaciones: notes,
                });
                setError(
                  parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."),
                );
                if (parsed.success) save.mutate(parsed.data);
              }}
            >
              Registrar hallazgo
            </Button>
            {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
          </div>
        )
      ) : null}
    </div>
  );
}
