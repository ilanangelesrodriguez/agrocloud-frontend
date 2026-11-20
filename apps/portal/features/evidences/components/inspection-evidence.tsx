"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import type { FormEvent } from "react";
import type { z } from "zod";

import { useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Select, toast } from "@heroui/react";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  LoadingState,
  PagePagination,
  StatusBadge,
} from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { evidence, evidenceMaxBytes, evidenceTypes } from "../schema";
import { uploadEvidence, analyzeEvidence } from "../api";
import { useEvidenceFruits } from "../hooks";
import { EvidenceReview } from "./evidence-review";
import type { aiDetection, manualFinding } from "@/features/agricultural/inspection";

export function InspectionEvidence({
  id,
  sampling,
  photos,
  canUpload,
  canAnalyze,
  canReadFruits,
  canReview,
  findings,
}: {
  id: string;
  sampling: number;
  photos: z.infer<typeof evidence>[];
  canUpload: boolean;
  canAnalyze: boolean;
  canReadFruits: boolean;
  canReview: boolean;
  findings: z.infer<typeof manualFinding>[];
}) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [fruit, setFruit] = useState("");
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const fruits = useEvidenceFruits(sampling, page, canUpload && canReadFruits);
  const refresh = () => invalidateOperationalQueries(cache);
  const upload = useMutation({
    mutationFn: (body: FormData) => uploadEvidence(id, body),
    onSuccess: ({ data }) => {
      setSelectedPhoto(data.id_evidencia);
      setFruit("");
      toast.success("Fotografía registrada");

      return refresh();
    },
    retry: false,
  });
  const analyze = useMutation({
    mutationFn: analyzeEvidence,
    onSuccess: () => {
      toast.success("Análisis IA enviado a la cola");
      return invalidateOperationalQueries(cache, { subscription: true });
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (upload.isPending) return;
    const form = new FormData(event.currentTarget);
    const photo = form.get("foto");

    if (
      !fruit ||
      !(photo instanceof File) ||
      !evidenceTypes.includes(photo.type) ||
      !photo.size ||
      photo.size > evidenceMaxBytes
    ) {
      setError("Selecciona un fruto y una imagen JPG, PNG o WebP de hasta 3 MB.");

      return;
    }
    setError("");
    form.set("id_fruto", fruit);
    upload.mutate(form);
  }

  const current = photos.find((photo) => photo.id_evidencia === selectedPhoto) ?? photos[0];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Fotografías por fruto</h2>
        <p className="mt-1 text-sm text-muted">
          Asocia cada imagen a su fruto y revisa el estado de su análisis.
        </p>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="font-semibold">Captura de evidencias</h3>
          {canUpload && canReadFruits ? (
            <form className="grid gap-3" onSubmit={submit}>
              <Select
                isDisabled={upload.isPending || !fruits.data?.data.length}
                placeholder="Selecciona un fruto"
                value={fruit || null}
                onChange={(value) => setFruit(typeof value === "string" ? value : "")}
              >
                <Label>Fruto de la muestra</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label="Frutos">
                    {fruits.data?.data.map((item) => (
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
              </Select>
              {fruits.isPending ? <LoadingState label="Cargando frutos" /> : null}
              {fruits.isError ? (
                <ErrorState
                  title="No se pudieron cargar los frutos"
                  error={fruits.error}
                  retry={() => fruits.refetch()}
                />
              ) : null}
              {fruits.data ? (
                <PagePagination
                  last={fruits.data.meta.last_page}
                  page={page}
                  onChange={(next) => {
                    setFruit("");
                    setPage(next);
                  }}
                />
              ) : null}
              <label htmlFor="evidence-photo">Fotografía (JPG, PNG o WebP, máximo 3 MB)</label>
              <Input
                key={upload.data?.data.id_evidencia}
                required
                accept={evidenceTypes.join(",")}
                disabled={upload.isPending}
                id="evidence-photo"
                name="foto"
                type="file"
              />
              {fruits.isSuccess && !fruits.data.data.length ? (
                <EmptyState
                  title="Sin frutos disponibles"
                  description="Revisa los frutos registrados en el muestreo antes de adjuntar una fotografía."
                />
              ) : null}
              <Button
                isDisabled={!fruit || upload.isPending || fruits.isError}
                type="submit"
                variant="primary"
              >
                {upload.isPending ? "Subiendo…" : "Subir fotografía"}
              </Button>
              {error || upload.error ? (
                <FormNotice message={error || upload.error?.message} />
              ) : null}
            </form>
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
          {photos.length ? (
            <ul className="space-y-2">
              {photos.map((photo) => (
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
                  {canAnalyze &&
                  photo.pertinencia !== "INVALIDA" &&
                  !["EN_COLA", "PROCESANDO", "COMPLETADO"].includes(photo.estado_ia ?? "") ? (
                    <Button
                      isDisabled={analyze.isPending}
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
              title="Sin evidencias registradas"
              description="Las evidencias capturadas aparecerán en esta sección."
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
