"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FormNotice, LoadingState, ErrorState, PagePagination } from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RecordField } from "@/features/agricultural/shared/record-field";

import { lotInput } from "../schema";
import { createLot } from "../api";
import { useLotCatalogs, useLotProducers } from "../hooks";

export function LotForm({
  canRead,
  canReadProducers,
}: {
  canRead: boolean;
  canReadProducers: boolean;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const [product, setProduct] = useState("");
  const [producerPage, setProducerPage] = useState(1);
  const [producerId, setProducerId] = useState("");
  const [error, setError] = useState("");
  const attempts = useRef(new Map<string, string>());
  const [products, varieties, units] = useLotCatalogs();
  const producers = useLotProducers(canReadProducers, producerPage);
  const productId = products.data?.data.find((item) => item.nombre === product)?.id;
  const save = useMutation({
    mutationFn: createLot,
    onSuccess: ({ data }) => {
      void cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
      void cache.invalidateQueries({ queryKey: ["company", "subscription"] });
      router.push(canRead ? "/lots/" + data.id_lote : "/dashboard");
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const date = new Date(String(fields.get("fecha_llegada_prevista") ?? ""));
    const parsed = lotInput.safeParse({
      id_productor: Number(producerId),
      codigo_lote: fields.get("codigo_lote"),
      producto: product,
      variedad: fields.get("variedad") || null,
      peso_kg: Number(fields.get("peso_kg")),
      unidad_medida: fields.get("unidad_medida"),
      fecha_llegada_prevista: Number.isFinite(date.getTime()) ? date.toISOString() : "",
    });

    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    if (!parsed.success) return;
    const body = JSON.stringify(parsed.data);
    const key = attempts.current.get(body) ?? crypto.randomUUID();

    attempts.current.set(body, key);
    save.mutate({ body, key });
  }

  const catalogs = [products, varieties, units];
  const failed = catalogs.find((query) => query.isError);

  if (failed?.error)
    return (
      <ErrorState
        error={failed.error}
        retry={() => {
          void Promise.all(catalogs.map((query) => query.refetch()));
        }}
      />
    );
  if (catalogs.some((query) => query.isPending)) return <LoadingState label="Cargando catálogos" />;

  return (
    <form className="space-y-4 rounded-card border border-border bg-surface p-5" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Registrar lote</legend>
        <div className="space-y-2">
          {canReadProducers ? (
            <>
              <label className="grid gap-1">
                Productor
                <select
                  required
                  className="rounded-field border border-border bg-surface p-2"
                  value={producerId}
                  onChange={(event) => setProducerId(event.target.value)}
                >
                  <option value="">Selecciona un productor</option>
                  {producers.data?.data.map((producer) => (
                    <option key={producer.id_productor} value={producer.id_productor}>
                      {producer.nombre_razon_social}
                    </option>
                  ))}
                </select>
              </label>
              {producers.isPending ? <p role="status">Cargando productores…</p> : null}
              {producers.isError ? <p role="alert">{producers.error.message}</p> : null}
              {producers.data && producers.data.meta.last_page > 1 ? (
                <PagePagination
                  last={producers.data.meta.last_page}
                  page={producerPage}
                  onChange={(next) => {
                    setProducerId("");
                    setProducerPage(next);
                  }}
                />
              ) : null}
            </>
          ) : (
            <label className="grid gap-1">
              ID del productor
              <input
                required
                className="rounded-field border border-border bg-surface p-2"
                min={1}
                type="number"
                value={producerId}
                onChange={(event) => setProducerId(event.target.value)}
              />
            </label>
          )}
        </div>
        <RecordField required label="Código del lote" maxLength={50} name="codigo_lote" />
        <label className="grid gap-1">
          Producto
          <select
            required
            className="rounded-field border border-border bg-surface p-2"
            value={product}
            onChange={(event) => setProduct(event.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {products.data?.data.map((item) => (
              <option key={item.id} value={item.nombre}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Variedad
          <select
            key={productId}
            className="rounded-field border border-border bg-surface p-2"
            disabled={!productId}
            name="variedad"
          >
            <option value="">Sin variedad</option>
            {varieties.data?.data
              .filter((item) => item.parent_id === productId)
              .map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
          </select>
        </label>
        <RecordField required label="Peso" name="peso_kg" step="any" type="number" />
        <label className="grid gap-1">
          Unidad de medida
          <select
            required
            className="rounded-field border border-border bg-surface p-2"
            name="unidad_medida"
          >
            <option value="">Selecciona una unidad</option>
            {units.data?.data.map((item) => (
              <option key={item.id} value={item.nombre}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <RecordField
          required
          label="Llegada prevista (hora local)"
          name="fecha_llegada_prevista"
          type="datetime-local"
        />
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">
        {save.isPending ? "Guardando…" : "Guardar lote"}
      </Button>
    </form>
  );
}
