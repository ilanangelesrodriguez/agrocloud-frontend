"use client";
import { fieldErrorsFrom } from "@/lib/form-fields";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import { FiSave } from "react-icons/fi";

import type { FormEvent } from "react";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanelBusy } from "@/components/route-drawer";
import {
  toast,
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  FieldError,
  Form,
} from "@heroui/react";
import { FormNotice, LoadingState, ErrorState, PagePagination } from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RecordField } from "@/features/agricultural/shared/record-field";
import { lotInput } from "../schema";
import { createLot } from "../api";
import { useLotCatalogs, useLotProducers } from "../hooks";

export function LotForm({
  canRead,
  canReadProducers,
  onSaved,
  onBusyChange,
}: {
  canRead: boolean;
  canReadProducers: boolean;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const router = useRouter();
  const panelBusy = usePanelBusy();
  const reportBusy = (busy: boolean) => {
    onBusyChange?.(busy);
    if (panelBusy !== onBusyChange) panelBusy?.(busy);
  };
  const cache = useQueryClient();
  const [product, setProduct] = useState("");
  const [variety, setVariety] = useState("");
  const [unit, setUnit] = useState("");
  const [producerPage, setProducerPage] = useState(1);
  const [producerId, setProducerId] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const attempts = useRef(new Map<string, string>());
  const [products, varieties, units] = useLotCatalogs();
  const producers = useLotProducers(canReadProducers, producerPage);
  const selectedProduct = products.data?.data.find((item) => String(item.id) === product);
  const productId = selectedProduct?.id;
  const validVarieties = (varieties.data?.data ?? []).filter(
    (item) => item.parent_id === productId,
  );

  const save = useMutation({
    mutationFn: createLot,
    onMutate: () => reportBusy(true),
    onSettled: () => reportBusy(false),
    onSuccess: ({ data }) => {
      toast.success("Lote registrado");
      void invalidateOperationalQueries(cache, { notifications: true, subscription: true });
      if (onSaved) onSaved();
      else router.push(canRead ? "/lots/" + data.id_lote : "/dashboard");
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
      producto_id: productId,
      variedad_id: variety ? Number(variety) : null,
      producto: selectedProduct?.nombre ?? "",
      variedad: validVarieties.find((item) => String(item.id) === variety)?.nombre ?? null,
      peso_kg: Number(fields.get("peso_kg")),
      unidad_medida: unit,
      fecha_llegada_prevista: Number.isFinite(date.getTime()) ? date.toISOString() : "",
    });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error.issues));
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del lote.");
      return;
    }
    setError("");
    setFieldErrors({});
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
    <Form
      onInputCapture={() => setFieldErrors({})}
      validationErrors={fieldErrors}
      validationBehavior="native"
      className="space-y-4 rounded-card border border-border bg-surface p-5"
      onSubmit={submit}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Datos del lote</legend>
        {canReadProducers ? (
          <div className="space-y-2">
            <Select
              variant="secondary"
              isDisabled={producers.isPending || save.isPending}
              name="id_productor"
              isRequired
              placeholder="Selecciona un productor"
              value={producerId || null}
              onChange={(value) => {
                setFieldErrors({});
                setProducerId(typeof value === "string" ? value : "");
              }}
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
              <FieldError />
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
            variant="secondary"
            value={producerId}
            onChange={setProducerId}
            name="id_productor"
            type="number"
            isRequired
          >
            <Label>ID del productor</Label>
            <Input placeholder="Ej. 24" variant="secondary" className="w-full" min={1} />
            <p className="text-xs text-muted">
              Para ver el catálogo de productores necesitas el permiso de consulta.
            </p>
            <FieldError />
          </TextField>
        )}

        <RecordField required label="Código del lote" maxLength={50} name="codigo_lote" />
        <Select
          variant="secondary"
          name="producto_id"
          isRequired
          placeholder="Selecciona un producto"
          value={product || null}
          onChange={(value) => {
            setFieldErrors({});
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
                <ListBox.Item
                  key={item.id}
                  id={String(item.id)}
                  textValue={`${item.nombre} · ${item.id_empresa ? "Empresa" : "Global"}`}
                >
                  {item.nombre} · {item.id_empresa ? "Empresa" : "Global"}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <FieldError />
        </Select>
        <Select
          variant="secondary"
          isDisabled={!productId || save.isPending}
          name="variedad_id"
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
                <ListBox.Item
                  key={item.id}
                  id={String(item.id)}
                  textValue={`${item.nombre} · ${item.id_empresa ? "Empresa" : "Global"}`}
                >
                  {item.nombre} · {item.id_empresa ? "Empresa" : "Global"}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <FieldError />
        </Select>
        <RecordField required label="Peso (kg)" name="peso_kg" step="any" type="number" />
        <Select
          variant="secondary"
          name="unidad_medida"
          isRequired
          placeholder="Selecciona una unidad"
          value={unit || null}
          onChange={(value) => {
            setFieldErrors({});
            setUnit(typeof value === "string" ? value : "");
          }}
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
                  {item.nombre} · {item.id_empresa ? "Empresa" : "Global"}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <FieldError />
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
        <FiSave aria-hidden="true" />
        {save.isPending ? "Guardando…" : "Guardar lote"}
      </Button>
    </Form>
  );
}
