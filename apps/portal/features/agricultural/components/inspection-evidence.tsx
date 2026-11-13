"use client";

import type { FormEvent } from "react";
import type { z } from "zod";

import { useState } from "react";
import { Button, Input, Label, ListBox, Select } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  analysisQueued,
  evidence,
  evidenceMaxBytes,
  evidenceResponse,
  evidenceTypes,
  samplingFruits,
} from "../inspection";

import { adminRequest } from "@/features/admin/api";
import { AdminPagination } from "@/features/admin/components/admin-ui";

export function InspectionEvidence({
  id,
  sampling,
  photos,
  canUpload,
  canAnalyze,
  canReadFruits,
}: {
  id: string;
  sampling: number;
  photos: z.infer<typeof evidence>[];
  canUpload: boolean;
  canAnalyze: boolean;
  canReadFruits: boolean;
}) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [fruit, setFruit] = useState("");
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const fruits = useQuery({
    enabled: canUpload && canReadFruits,
    queryKey: ["agricultural", "samplings", "fruits", String(sampling), page],
    queryFn: ({ signal }) =>
      adminRequest(
        "samplings/" + sampling + "/fruits?page=" + page,
        samplingFruits,
        { signal },
        "agricultural",
      ),
    retry: false,
  });
  const refresh = () =>
    cache.invalidateQueries({ queryKey: ["agricultural", "inspections", "detail", id] });
  const upload = useMutation({
    mutationFn: (body: FormData) =>
      adminRequest(
        "inspections/" + id + "/evidences",
        evidenceResponse,
        { method: "POST", body },
        "agricultural",
      ),
    onSuccess: ({ data }) => {
      setSelectedPhoto(data.id_evidencia);

      return refresh();
    },
    retry: false,
  });
  const analyze = useMutation({
    mutationFn: (photo: number) =>
      adminRequest(
        "evidences/" + photo + "/analyze",
        analysisQueued,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
        "agricultural",
      ),
    onSuccess: refresh,
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

  const current = photos.find((photo) => photo.id_evidencia === selectedPhoto);

  return (
    <section className="space-y-4 rounded-card border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Fotografías por fruto</h2>
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
          {fruits.isPending ? <p role="status">Cargando frutos…</p> : null}
          {fruits.isError ? (
            <Button
              type="button"
              variant="secondary"
              onPress={() => {
                void fruits.refetch();
              }}
            >
              Reintentar cargar frutos
            </Button>
          ) : null}
          {fruits.data ? (
            <AdminPagination
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
          <Button isDisabled={!fruit || upload.isPending} type="submit" variant="primary">
            {upload.isPending ? "Subiendo…" : "Subir fotografía"}
          </Button>
          {error || upload.error ? <p role="alert">{error || upload.error?.message}</p> : null}
        </form>
      ) : canUpload ? (
        <p>Para seleccionar un fruto necesitas acceso al muestreo.</p>
      ) : null}
      {photos.length ? (
        <ul className="space-y-2">
          {photos.map((photo) => (
            <li key={photo.id_evidencia} className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onPress={() => setSelectedPhoto(photo.id_evidencia)}
              >
                Ver evidencia #{photo.id_evidencia}
              </Button>
              <span>
                Fruto #{photo.id_fruto} · {photo.estado_ia?.replaceAll("_", " ") ?? "Sin análisis"}
              </span>
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
        <p>Sin evidencias registradas.</p>
      )}
      {analyze.error ? <p role="alert">{analyze.error.message}</p> : null}
      {current ? (
        // The same-origin route authorizes each request using the session cookie.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={"Evidencia del fruto " + current.id_fruto}
          className="max-h-96 max-w-full rounded-lg object-contain"
          src={"/api/agricultural/evidences/" + current.id_evidencia + "/image"}
        />
      ) : null}
    </section>
  );
}
