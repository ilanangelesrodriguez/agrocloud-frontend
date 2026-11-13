"use client";

import type { FormEvent } from "react";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, ListBox, Select, TextField } from "@heroui/react";
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
  const [variety, setVariety] = useState("");
  const [unit, setUnit] = useState("");
  const [producerPage, setProducerPage] = useState(1);
  const [producerId, setProducerId] = useState("");
  const [error, setError] = useState("");
  const attempts = useRef(new Map<string, string>());
  const [products, varieties, units] = useLotCatalogs();
  const producers = useLotProducers(canReadProducers, producerPage);
  const productId = products.data?.data.find((item) => item.nombre === product)?.id;
  const validVarieties = (varieties.data?.data ?? []).filter(
    (item) => item.parent_id === productId,
  );

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
      codigo_lote: String(fields.get("codigo_lote") ?? "").trim(),
      producto: product,
      variedad: variety || null,
      peso_kg: Number(fields.get("peso_kg")),
      unidad_medida: unit,
      fecha_llegada_prevista: Number.isFinite(date.getTime()) ? date.toISOString() : "",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del lote.");
      return;
    }
    setError("");
    const body = JSON.stringify(parsed.data);
    const key = attempts.current.get(body) ?? crypto.randomUUID();
    attempts.current.set(body, key);
    save.mutate({ body, key });
  }

  const catalogs = [products, varieties, units];
  const failure = catalogs.find((query) => query.isError);
  if (failure?.error) {
    return (
      <ErrorState
        error={failure.error}
        retry={() => void Promise.all(catalogs.map((query) => query.refetch()))}
      />
    );
  }
  if (catalogs.some((query) => query.isPending)) {
    return <LoadingState label="Cargando catálogos" />;
  }

  return (
    <form className="space-y-4 rounded-card border border-border bg-surface p-5" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Registrar lote</legend>
        {canReadProducers ? (
          <div className="space-y-2">
            <Select
              isDisabled={producers.isPending || save.isPending}
              placeholder="Selecciona un productor"
              value={producerId || null}
              onChange={(value) => setProducerId(typeof value === "string" ? value : "")}
            >
              <Label>Productor</Label>
              <Select.Trigger className="min-h-11 w-full">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label="Productores disponibles">
                  {(producers.data?.data ?? []).map((producer) => (
                    <ListBox.Item
                      key={producer.id_productor}
                      id={String(producer.id_productor)}
                      textValue={producer.nombre_razon_social}
                    >
                      {producer.nombre_razon_social} · {producer.ruc}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {producers.isPending ? <LoadingState label="Cargando productores" /> : null}
            {producers.isError ? (
              <div className="grid gap-2">
                <FormNotice message={producers.error.message} />
                <Button size="sm" variant="secondary" onPress={() => void producers.refetch()}>
                  Reintentar cargar productores
                </Button>
              </div>
            ) : null}
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
          </div>
        ) : (
          <TextField
            value={producerId}
            onChange={setProducerId}
            name="id_productor"
            type="number"
            isRequired
          >
            <Label>ID del productor</Label>
            <Input className="w-full" min={1} />
            <p className="text-xs text-muted">
              Para ver el catálogo de productores necesitas el permiso de consulta.
            </p>
          </TextField>
        )}

        <RecordField required label="Código del lote" maxLength={50} name="codigo_lote" />
        <Select
          placeholder="Selecciona un producto"
          value={product || null}
          onChange={(value) => {
            setProduct(typeof value === "string" ? value : "");
            setVariety("");
          }}
        >
          <Label>Producto</Label>
          <Select.Trigger className="min-h-11 w-full">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Productos disponibles">
              {(products.data?.data ?? []).map((item) => (
                <ListBox.Item key={item.id} id={item.nombre} textValue={item.nombre}>
                  {item.nombre}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          isDisabled={!productId || save.isPending}
          placeholder="Sin variedad"
          value={variety || null}
          onChange={(value) =>
            setVariety(typeof value === "string" && value !== "none" ? value : "")
          }
        >
          <Label>Variedad (opcional)</Label>
          <Select.Trigger className="min-h-11 w-full">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Variedades disponibles">
              <ListBox.Item id="none" textValue="Sin variedad">
                Sin variedad
              </ListBox.Item>
              {validVarieties.map((item) => (
                <ListBox.Item key={item.id} id={item.nombre} textValue={item.nombre}>
                  {item.nombre}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <RecordField required label="Peso (kg)" name="peso_kg" step="any" type="number" />
        <Select
          placeholder="Selecciona una unidad"
          value={unit || null}
          onChange={(value) => setUnit(typeof value === "string" ? value : "")}
        >
          <Label>Unidad de medida</Label>
          <Select.Trigger className="min-h-11 w-full">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Unidades de medida disponibles">
              {(units.data?.data ?? []).map((item) => (
                <ListBox.Item key={item.id} id={item.nombre} textValue={item.nombre}>
                  {item.nombre}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <RecordField
          required
          label="Llegada prevista (hora local)"
          name="fecha_llegada_prevista"
          type="datetime-local"
        />
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button
        isDisabled={save.isPending || !producerId || !product || !unit}
        type="submit"
        variant="primary"
      >
        {save.isPending ? "Guardando…" : "Guardar lote"}
      </Button>
    </form>
  );
}
