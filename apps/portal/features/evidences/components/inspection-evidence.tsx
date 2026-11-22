"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import type { FormEvent } from "react";
import type { z } from "zod";

import { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiImage, FiInfo, FiTrash2 } from "react-icons/fi";
import {
  Tabs,
  Button,
  Checkbox,
  Label,
  ListBox,
  Select,
  toast,
  Form,
  FieldError,
} from "@heroui/react";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  LoadingState,
  PagePagination,
  StatusBadge,
} from "@agrocloud/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { evidence, evidenceMaxBytes, evidenceTypes } from "../schema";
import {
  uploadEvidence,
  analyzeEvidence,
  requestAnalysisBatch,
  fetchAnalysisBatch,
  retryAnalysisBatch,
} from "../api";
import { useEvidenceFruits } from "../hooks";
import { EvidenceReview } from "./evidence-review";
import { EvidenceDropZone } from "./evidence-drop-zone";
import type { aiDetection, manualFinding } from "@/features/agricultural/inspection";

export function InspectionEvidence({
  id,
  sampling,
  initialBatchId,
  aiSupported,
  photos,
  canUpload,
  canAnalyze,
  canReadFruits,
  canReview,
  findings,
}: {
  id: string;
  sampling: number;
  initialBatchId?: string | null;
  aiSupported: boolean;
  photos: z.infer<typeof evidence>[];
  canUpload: boolean;
  canAnalyze: boolean;
  canReadFruits: boolean;
  canReview: boolean;
  findings: z.infer<typeof manualFinding>[];
}) {
  const cache = useQueryClient();
  const [photoFilter, setPhotoFilter] = useState("all");
  useEffect(() => {
    if (window.location.hash === "#pending") setPhotoFilter("pending");
  }, []);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [requestedBatchId, setBatchId] = useState<string | null>(null);
  const batchId = requestedBatchId ?? initialBatchId ?? null;
  const operation = useRef<{ signature: string; key: string } | null>(null);
  const batch = useQuery({
    queryKey: ["agricultural", "analysis-batch", id, batchId],
    enabled: !!batchId,
    queryFn: ({ signal }) => fetchAnalysisBatch(id, batchId!, signal),
    refetchInterval: ({ state }) => (state.data?.status === "PROCESSING" ? 5000 : false),
    retry: false,
  });
  const collective = useMutation({
    mutationFn: async (ids: number[]) => {
      const signature = [...ids].sort((a, b) => a - b).join(",");
      if (operation.current?.signature !== signature)
        operation.current = { signature, key: crypto.randomUUID() };
      return requestAnalysisBatch(id, ids, operation.current.key);
    },
    onSuccess: async (result) => {
      operation.current = null;
      setBatchId(result.batchId);
      cache.setQueryData(["agricultural", "analysis-batch", id, result.batchId], result);
      toast.success("Solicitud registrada. Esperando que el worker procese las fotografías.");
      await invalidateOperationalQueries(cache, { subscription: true });
    },
    retry: false,
  });
  const retryBatch = useMutation({
    mutationFn: () => retryAnalysisBatch(id, batchId!),
    onSuccess: async (result) => {
      cache.setQueryData(["agricultural", "analysis-batch", id, batchId], result);
      await invalidateOperationalQueries(cache, { subscription: true });
    },
    retry: false,
  });
  const analyze = useMutation({
    mutationFn: analyzeEvidence,
    onSuccess: () => {
      toast.success(
        "Solicitud registrada. El resultado estará disponible cuando termine el análisis.",
      );
      return invalidateOperationalQueries(cache, { subscription: true });
    },
    retry: false,
  });

  function pendingDecisions(photo: z.infer<typeof evidence>) {
    return (photo.resultado_ia?.detections ?? []).filter(
      (detection, index) =>
        !(photo.validaciones ?? []).some(
          (validation) =>
            validation.indice_deteccion === index &&
            (!validation.detection_id || validation.detection_id === detection.id),
        ),
    ).length;
  }
  const shownPhotos = photos.filter((photo) =>
    photoFilter === "discarded"
      ? photo.pertinencia === "INVALIDA"
      : photoFilter === "pending"
        ? photo.pertinencia !== "INVALIDA" &&
          (!photo.reviewed_at ||
            photo.pertinencia !== "VALIDA" ||
            ["EN_COLA", "PROCESANDO"].includes(photo.estado_ia ?? "") ||
            pendingDecisions(photo) > 0)
        : true,
  );
  const current =
    shownPhotos.find((photo) => photo.id_evidencia === selectedPhoto) ?? shownPhotos[0];

  const eligible = photos.filter(
    (photo) =>
      photo.pertinencia !== "INVALIDA" &&
      !["EN_COLA", "PROCESANDO", "COMPLETADO"].includes(photo.estado_ia ?? ""),
  );
  const failed = eligible.filter((photo) => photo.estado_ia === "ERROR");
  const completed = photos.filter((photo) => photo.estado_ia === "COMPLETADO").length;
  const active = photos.filter((photo) =>
    ["EN_COLA", "PROCESANDO"].includes(photo.estado_ia ?? ""),
  ).length;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Fotografías por fruto</h2>
        <p className="mt-1 text-sm text-muted">
          Asocia cada imagen a su fruto y revisa el estado de su análisis.
        </p>
      </div>
      {!aiSupported ? (
        <p role="status" className="rounded-xl border border-border p-3 text-sm">
          Este producto no tiene un modelo IA compatible configurado. Puedes subir evidencias y
          continuar con revisión manual justificada.
        </p>
      ) : null}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 shadow-sm shadow-black/5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">Añadir fotografías</h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                Organiza las imágenes por fruto antes de guardarlas.
              </p>
            </div>
            <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
              Evidencias
            </span>
          </div>
          {canUpload && canReadFruits ? (
            <MultipleEvidenceUpload
              key={id}
              id={id}
              sampling={sampling}
              canAnalyze={canAnalyze}
              analysisPending={collective.isPending}
              onAnalyze={(ids) => collective.mutateAsync(ids).then(() => undefined)}
              onUploaded={(photoId) => setSelectedPhoto(photoId)}
            />
          ) : canUpload ? (
            <p>Para seleccionar un fruto necesitas acceso al muestreo.</p>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              Esta inspección está disponible para consulta. La captura requiere una inspección en
              curso y permisos del inspector asignado.
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Evidencias registradas</h3>
            <span className="text-sm tabular-nums text-muted">{photos.length} fotografías</span>
          </div>
          <div className="space-y-3" aria-live="polite">
            <p className="text-sm">
              {completed} de {photos.length} fotografías analizadas · {active} pendientes o en
              proceso · {failed.length} fallidas
            </p>
            {photos.length > 0 ? (
              <progress
                className="w-full"
                value={completed}
                max={photos.length}
                aria-label="Fotografías analizadas"
              />
            ) : null}
            {canAnalyze && eligible.length > 0 ? (
              <Button
                isDisabled={
                  collective.isPending ||
                  analyze.isPending ||
                  retryBatch.isPending ||
                  eligible.length > 100
                }
                onPress={() => collective.mutate(eligible.map((photo) => photo.id_evidencia))}
              >
                Solicitar análisis de {eligible.length} fotografías
              </Button>
            ) : null}
            {canAnalyze && failed.length > 0 ? (
              <Button
                variant="secondary"
                isDisabled={collective.isPending || retryBatch.isPending || failed.length > 100}
                onPress={() => collective.mutate(failed.map((photo) => photo.id_evidencia))}
              >
                Reintentar únicamente {failed.length} fallidas
              </Button>
            ) : null}
            {eligible.length > 100 ? (
              <p>Selecciona hasta 100 fotografías por carga para analizarlas juntas.</p>
            ) : null}
            {batch.data ? (
              <div className="rounded-xl border border-border p-3 text-sm">
                <p>
                  Último conjunto: {batch.data.completed} de {batch.data.total} completadas ·{" "}
                  {batch.data.processing} analizando · {batch.data.pending} esperando ·{" "}
                  {batch.data.failed} fallidas · {batch.data.cancelled} canceladas
                </p>
                {batch.data.stalled ? (
                  <p role="status">
                    El procesamiento lleva más de cinco minutos sin avanzar. Revisa el servicio;
                    puedes cancelar las solicitudes en espera y continuar con revisión manual
                    justificada.
                  </p>
                ) : null}
                {batch.data.items
                  .filter((item) => item.stage === "RETRYING")
                  .map((item) => (
                    <p key={item.evidenceId}>
                      Evidencia #{item.evidenceId}: nuevo intento programado ({item.attempts}/3).{" "}
                      {item.errorCode}
                    </p>
                  ))}
                {canAnalyze && batch.data.failed > 0 ? (
                  <Button
                    variant="secondary"
                    isDisabled={retryBatch.isPending || collective.isPending}
                    onPress={() => retryBatch.mutate()}
                  >
                    Reintentar fallidas de este conjunto
                  </Button>
                ) : null}
              </div>
            ) : null}
            {collective.error || retryBatch.error || batch.error ? (
              <FormNotice
                message={(collective.error ?? retryBatch.error ?? batch.error)?.message}
              />
            ) : null}
          </div>
          <Tabs
            variant="secondary"
            selectedKey={photoFilter}
            onSelectionChange={(key) => setPhotoFilter(String(key))}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Filtrar evidencias">
                {[
                  ["all", "Todas"],
                  ["pending", "Por revisar"],
                  ["discarded", "Descartadas"],
                ].map(([key, label]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <p className="text-xs text-muted">
            «Por revisar» muestra revisiones sin guardar, pertinencia pendiente, análisis en curso o
            detecciones sin decisión. La vigencia final de revisiones guardadas se comprueba en
            Validación.
          </p>
          {shownPhotos.length ? (
            <ul className="space-y-2">
              {shownPhotos.map((photo) => (
                <li
                  key={photo.id_evidencia}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${current?.id_evidencia === photo.id_evidencia ? "border-accent bg-accent/5" : "border-border"}`}
                >
                  <Button
                    type="button"
                    aria-pressed={current?.id_evidencia === photo.id_evidencia}
                    variant="secondary"
                    onPress={() => setSelectedPhoto(photo.id_evidencia)}
                  >
                    Ver evidencia #{photo.id_evidencia}
                  </Button>
                  <span className="text-sm">Fruto #{photo.id_fruto}</span>
                  <StatusBadge
                    tone={
                      photo.estado_ia === "COMPLETADO"
                        ? "success"
                        : ["EN_COLA", "PROCESANDO"].includes(photo.estado_ia ?? "")
                          ? "info"
                          : "neutral"
                    }
                  >
                    {photo.estado_ia?.replaceAll("_", " ") ?? "Sin análisis"}
                  </StatusBadge>
                  <span className="text-xs text-muted">
                    {photo.pertinencia === "INVALIDA"
                      ? "Descartada · Conservada en historial"
                      : pendingDecisions(photo) +
                        " detecciones sin decisión" +
                        (photo.reviewed_at ? " · Revisión guardada" : " · Revisión sin guardar")}
                  </span>
                  {photo.error_ia ? (
                    <p className="w-full text-sm" role="status">
                      {photo.error_ia}
                    </p>
                  ) : null}
                  {canAnalyze &&
                  photo.pertinencia !== "INVALIDA" &&
                  !["EN_COLA", "PROCESANDO", "COMPLETADO"].includes(photo.estado_ia ?? "") ? (
                    <Button
                      isDisabled={analyze.isPending || collective.isPending || retryBatch.isPending}
                      type="button"
                      variant="secondary"
                      onPress={() => analyze.mutate(photo.id_evidencia)}
                    >
                      Solicitar análisis IA
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={
                photos.length ? "No hay evidencias para este filtro" : "Sin evidencias registradas"
              }
              description={
                photos.length
                  ? "Selecciona Todas para consultar el historial completo de fotografías."
                  : "Las evidencias capturadas aparecerán en esta sección."
              }
            />
          )}
          {analyze.error ? <FormNotice message={analyze.error.message} /> : null}
          {current ? (
            <>
              <EvidencePreview
                key={current.id_evidencia}
                id={current.id_evidencia}
                fruit={current.id_fruto}
                detections={current.resultado_ia?.detections ?? []}
              />
              <EvidenceReview
                key={"review-" + current.id_evidencia}
                inspectionId={id}
                photo={current}
                findings={findings}
                canReview={canReview}
                canAnalyze={canAnalyze}
              />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type PreparedPhoto = {
  key: string;
  file: File;
  fruit: string;
  status: "ready" | "uploading" | "uploaded" | "error";
  evidenceId?: number;
  error?: string;
};

function MultipleEvidenceUpload({
  id,
  sampling,
  canAnalyze,
  analysisPending,
  onAnalyze,
  onUploaded,
}: {
  id: string;
  sampling: number;
  canAnalyze: boolean;
  analysisPending: boolean;
  onAnalyze: (ids: number[]) => Promise<void>;
  onUploaded: (id: number) => void;
}) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const fruits = useEvidenceFruits(sampling, page, true);
  const [options, setOptions] = useState<{ id: number; numero: number; codigo?: string | null }[]>(
    [],
  );
  const [rows, setRows] = useState<PreparedPhoto[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [automatic, setAutomatic] = useState(true);
  const [error, setError] = useState("");
  const busy = useRef(false);
  useEffect(() => {
    if (fruits.data)
      setOptions((previous) => {
        const merged = new Map(previous.map((item) => [item.id, item]));
        fruits.data.data.forEach((item) => merged.set(item.id, item));
        return [...merged.values()];
      });
  }, [fruits.data]);

  function prepare(files: File[]) {
    if (busy.current || analysisPending) return;
    if (rows.length + files.length > 100) {
      setError("Prepara como máximo 100 fotografías por carga.");
      return;
    }
    const invalid = files.find(
      (file) => !evidenceTypes.includes(file.type) || !file.size || file.size > evidenceMaxBytes,
    );
    if (invalid) {
      setError(invalid.name + ": selecciona JPG, PNG o WebP de hasta 3 MB.");
      return;
    }
    const suggestions = fruits.data?.data ?? [];
    setRows((previous) => [
      ...previous,
      ...files.map((file, index): PreparedPhoto => {
        const stem = file.name.replace(/\.[^.]+$/, "").toLocaleLowerCase();
        const matched = options.find((item) => item.codigo?.toLocaleLowerCase() === stem);
        return {
          key: crypto.randomUUID(),
          file,
          fruit: String(matched?.id ?? suggestions[index]?.id ?? ""),
          status: "ready",
        };
      }),
    ]);
    setConfirmed(false);
    setError("");
  }

  const upload = useMutation({
    mutationFn: async () => {
      if (busy.current) return;
      busy.current = true;
      setError("");
      const snapshot = rows.filter((row) => !row.evidenceId);
      const uploaded: number[] = [];
      let cursor = 0;
      try {
        await Promise.all(
          Array.from({ length: Math.min(2, snapshot.length) }, async () => {
            for (;;) {
              const row = snapshot[cursor++];
              if (!row) break;
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key ? { ...item, status: "uploading", error: undefined } : item,
                ),
              );
              try {
                const body = new FormData();
                body.set("id_fruto", row.fruit);
                body.set("foto", row.file);
                const result = await uploadEvidence(id, body);
                uploaded.push(result.data.id_evidencia);
                onUploaded(result.data.id_evidencia);
                setRows((current) =>
                  current.map((item) =>
                    item.key === row.key
                      ? { ...item, status: "uploaded", evidenceId: result.data.id_evidencia }
                      : item,
                  ),
                );
              } catch (cause) {
                setRows((current) =>
                  current.map((item) =>
                    item.key === row.key
                      ? {
                          ...item,
                          status: "error",
                          error:
                            cause instanceof Error
                              ? cause.message
                              : "No se pudo subir la fotografía.",
                        }
                      : item,
                  ),
                );
              }
            }
          }),
        );
        if (uploaded.length) {
          toast.success(uploaded.length + " fotografías registradas");
          await invalidateOperationalQueries(cache);
          if (canAnalyze && automatic) await onAnalyze(uploaded);
        }
      } finally {
        busy.current = false;
      }
    },
    retry: false,
  });
  const pending = rows.filter((row) => !row.evidenceId);
  const disabled = upload.isPending || analysisPending;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || busy.current || !pending.length) return;
    if (!confirmed || pending.some((row) => !row.fruit)) {
      setError("Asocia cada fotografía y confirma los frutos antes de guardar.");
      return;
    }
    upload.mutate();
  }
  return (
    <Form validationBehavior="native" className="grid gap-4" onSubmit={submit}>
      <EvidenceDropZone
        disabled={disabled}
        maxFiles={100}
        selectedCount={rows.length}
        onFiles={prepare}
      />
      {fruits.isPending ? <LoadingState label="Cargando frutos" /> : null}
      {fruits.isError ? (
        <ErrorState
          title="No se pudieron cargar los frutos"
          error={fruits.error}
          retry={() => fruits.refetch()}
        />
      ) : null}
      {fruits.data ? (
        <PagePagination page={page} last={fruits.data.meta.last_page} onChange={setPage} />
      ) : null}
      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-secondary/50 p-3 text-xs leading-5 text-muted">
        <FiInfo aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
        <p>
          La asociación inicial se sugiere por código o por orden de la página. <strong className="text-foreground">Confirma cada fruto</strong> antes de guardar. Puedes vincular varias fotografías a un fruto y cargar más desde otras páginas.
        </p>
      </div>
      {rows.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Fotografías preparadas <span className="font-normal text-muted">({rows.length}/100)</span>
          </p>
          <span className="text-xs tabular-nums text-muted">
            {rows.filter((row) => row.evidenceId).length} guardadas
          </span>
        </div>
      ) : null}
      <ul className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
        {rows.map((row) => (
          <li
            key={row.key}
            className="space-y-3 rounded-2xl border border-border bg-surface p-3 transition-colors duration-200 hover:border-accent/25"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                <PreparedPreview file={row.file} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={row.file.name}>
                  {row.file.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <FiImage aria-hidden="true" />
                  {(row.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="mt-1 text-xs text-muted">
                  {row.status === "uploaded"
                    ? "Guardada como evidencia #" + row.evidenceId
                    : row.status === "uploading"
                      ? "Subiendo fotografía…"
                      : row.status === "error"
                        ? row.error
                        : "Lista para asociar"}
                </p>
              </div>
            </div>
            <Select
              variant="secondary"
              value={row.fruit || null}
              placeholder="Selecciona un fruto"
              isDisabled={disabled || !!row.evidenceId}
              onChange={(value) => {
                setConfirmed(false);
                setRows((current) =>
                  current.map((item) =>
                    item.key === row.key ? { ...item, fruit: String(value ?? "") } : item,
                  ),
                );
              }}
            >
              <Label>Fruto asociado a {row.file.name}</Label>
              <Select.Trigger className="min-h-11 w-full">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label="Frutos de la muestra">
                  {options.map((item) => (
                    <ListBox.Item
                      key={item.id}
                      id={String(item.id)}
                      textValue={item.codigo ?? "Fruto " + item.numero}
                    >
                      {item.codigo ?? "Fruto " + item.numero}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError />
            </Select>
            <div aria-live="polite" className="flex items-center gap-2 text-xs text-muted">
              {row.status === "uploaded" ? (
                <FiCheckCircle aria-hidden="true" className="size-4 text-accent" />
              ) : null}
              <span>
                {row.status === "uploaded"
                  ? "Fotografía registrada correctamente"
                  : row.status === "uploading"
                    ? "Guardando en el sistema…"
                    : row.status === "error"
                      ? "No se pudo guardar; puedes reintentar."
                      : "Pendiente de confirmación"}
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              isDisabled={disabled}
              onPress={() => {
                setRows((current) => current.filter((item) => item.key !== row.key));
                setConfirmed(false);
              }}
            >
              <FiTrash2 aria-hidden="true" className="size-4" />
              {row.evidenceId ? "Quitar de esta lista" : "Quitar fotografía"}
            </Button>
          </li>
        ))}
      </ul>
      {rows.length ? (
        <p aria-live="polite" className="text-sm">
          {rows.filter((row) => row.evidenceId).length} de {rows.length} fotografías guardadas
        </p>
      ) : null}
      {pending.length ? (
        <Checkbox isSelected={confirmed} isDisabled={disabled} onChange={setConfirmed}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>He revisado y confirmo la asociación de cada fotografía con su fruto</Label>
          </Checkbox.Content>
        </Checkbox>
      ) : null}
      {canAnalyze ? (
        <Checkbox isSelected={automatic} isDisabled={disabled} onChange={setAutomatic}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>Solicitar IA después de subir (consume la cuota de análisis)</Label>
          </Checkbox.Content>
        </Checkbox>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        isDisabled={disabled || !pending.length || !confirmed || pending.some((row) => !row.fruit)}
      >
        {upload.isPending
          ? "Guardando fotografías…"
          : "Subir " +
            pending.length +
            (canAnalyze && automatic ? " y solicitar análisis" : " fotografías")}
      </Button>
      {error || upload.error ? <FormNotice message={error || upload.error?.message} /> : null}
    </Form>
  );
}

function PreparedPreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? (
    <img
      src={url}
      alt={"Vista previa de " + file.name}
      className="h-full w-full object-cover"
    />
  ) : null;
}

function EvidencePreview({
  id,
  fruit,
  detections,
}: {
  id: number;
  fruit: number;
  detections: z.infer<typeof aiDetection>[];
}) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>();
  const [showRegions, setShowRegions] = useState(true);
  if (failed)
    return (
      <ErrorState
        title="No se pudo cargar la fotografía"
        error="La imagen no está disponible o tu sesión no permite consultarla."
        retry={() => {
          setLoading(true);
          setFailed(false);
        }}
      />
    );
  return (
    <figure className="space-y-3">
      {detections.length ? (
        <Checkbox isSelected={showRegions} onChange={setShowRegions}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>Mostrar regiones detectadas por IA</Label>
          </Checkbox.Content>
        </Checkbox>
      ) : null}
      <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary">
        {loading ? (
          <div className="absolute inset-0">
            <LoadingState
              variant="spinner"
              label="Cargando fotografía"
              className="h-full border-0 bg-transparent"
            />
          </div>
        ) : null}
        {/* La ruta del mismo origen autoriza la imagen con la cookie de sesión. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Evidencia #${id} del fruto ${fruit}`}
          className="max-h-[36rem] w-full object-contain"
          src={`/api/agricultural/evidences/${id}/image`}
          onLoad={(event) => {
            setLoading(false);
            setDimensions({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
          }}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
        {showRegions && dimensions && !loading ? (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {detections.slice(0, 100).map((detection, index) => (
              <g key={detection.id}>
                <rect
                  x={detection.box.x1}
                  y={detection.box.y1}
                  width={Math.max(0, detection.box.x2 - detection.box.x1)}
                  height={Math.max(0, detection.box.y2 - detection.box.y1)}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={Math.max(2, dimensions.width / 350)}
                />
                <text
                  x={detection.box.x1 + 4}
                  y={Math.max(dimensions.width / 40, detection.box.y1 + dimensions.width / 40)}
                  fill="var(--accent)"
                  stroke="var(--background)"
                  strokeWidth={1}
                  paintOrder="stroke"
                  fontWeight="bold"
                  fontSize={Math.max(14, dimensions.width / 40)}
                >
                  {index + 1}
                </text>
              </g>
            ))}
          </svg>
        ) : null}
      </div>
      <figcaption className="text-sm text-muted">
        Evidencia #{id} · Fruto #{fruit}
        {detections.length > 100
          ? " · Se muestran las primeras 100 regiones; todas las detecciones están disponibles en el listado de revisión."
          : detections.length
            ? " · Los números corresponden al listado de detecciones."
            : ""}
      </figcaption>
    </figure>
  );
}
