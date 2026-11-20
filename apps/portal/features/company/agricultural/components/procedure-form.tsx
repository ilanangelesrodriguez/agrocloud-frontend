"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Checkbox, Input, Label, TextArea, TextField, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorState, FormNotice, InlineNotice, LoadingState } from "@agrocloud/ui";
import { createProcedure } from "../api";
import { useMasterCatalog } from "../hooks";
import { procedureInput } from "../schema";
import type { Procedure, CatalogItem } from "../schema";
import { CatalogSelect } from "./catalog-select";

function findMaster(items: CatalogItem[] | undefined, key: string) {
  const matches = key.startsWith("legacy:")
    ? (items ?? []).filter((item) => item.nombre === key.slice(7))
    : (items ?? []).filter((item) => String(item.id) === key);
  return matches.length === 1 ? matches[0] : undefined;
}

export function ProcedureForm({
  source,
  onSaved,
  onBusyChange,
}: {
  source?: Procedure;
  onSaved: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const cache = useQueryClient();
  const products = useMasterCatalog("producto", true);
  const methods = useMasterCatalog("metodo", true);
  const [product, setProduct] = useState(
    source?.producto_id
      ? String(source.producto_id)
      : source?.producto
        ? "legacy:" + source.producto
        : "",
  );
  const [method, setMethod] = useState(
    source?.metodo_id ? String(source.metodo_id) : source?.metodo ? "legacy:" + source.metodo : "",
  );
  const [population, setPopulation] = useState(source?.requiere_poblacion ?? false);
  const [error, setError] = useState("");
  const create = useMutation({
    mutationFn: createProcedure,
    retry: false,
    onMutate: () => onBusyChange(true),
    onSettled: () => onBusyChange(false),
    onSuccess: async () => {
      await invalidateOperationalQueries(cache);
      toast.success(source ? "Nueva versión registrada" : "Procedimiento registrado");
      onSaved();
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;
    const fields = new FormData(event.currentTarget);
    const recommended = String(fields.get("tamano_recomendado") ?? "").trim();
    const parsed = procedureInput.safeParse({
      nombre: fields.get("nombre"),
      version: fields.get("version"),
      metodo_id: findMaster(methods.data?.data, method)?.id,
      producto_id: findMaster(products.data?.data, product)?.id ?? null,
      metodo: findMaster(methods.data?.data, method)?.nombre ?? "",
      producto: findMaster(products.data?.data, product)?.nombre ?? null,
      criterio_muestra: fields.get("criterio_muestra"),
      seleccion_frutos: fields.get("seleccion_frutos"),
      max_frutos: Number(fields.get("max_frutos")),
      tamano_recomendado: recommended ? Number(recommended) : null,
      requiere_poblacion: population,
    });
    if (
      source &&
      parsed.success &&
      parsed.data.nombre === source.nombre &&
      parsed.data.version === String(source.version)
    ) {
      setError("Usa una versión diferente a la del procedimiento original.");
      return;
    }
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    if (parsed.success) create.mutate(parsed.data);
  }
  if (products.isPending || methods.isPending)
    return <LoadingState label="Cargando productos y métodos" />;
  const failed = products.error ?? methods.error;
  if (failed)
    return (
      <ErrorState
        error={failed}
        retry={() => void Promise.all([products.refetch(), methods.refetch()])}
      />
    );
  const methodItems = (methods.data?.data ?? []).filter((item) => item.habilitado !== false);
  const productItems = (products.data?.data ?? []).filter((item) => item.habilitado !== false);
  return (
    <form onSubmit={submit} className="space-y-5">
      {source ? (
        <InlineNotice
          status="accent"
          title={"Basado en " + source.nombre + " · v" + source.version}
          description="Se creará un procedimiento independiente y activo. La versión anterior conservará su estado hasta que la desactives."
        />
      ) : null}
      {!methodItems.length ? (
        <InlineNotice
          status="warning"
          title="Faltan métodos de muestreo"
          description="Registra un método en Maestros antes de crear un procedimiento."
        />
      ) : null}
      <fieldset disabled={create.isPending} className="grid gap-5">
        <TextField isRequired name="nombre" defaultValue={source?.nombre ?? ""}>
          <Label>Nombre del procedimiento</Label>
          <Input maxLength={150} />
        </TextField>
        <TextField isRequired name="version" defaultValue={source ? "" : "1.0"}>
          <Label>Versión</Label>
          <Input maxLength={30} placeholder={source ? "Nueva versión" : "1.0"} />
        </TextField>
        <CatalogSelect
          label="Producto"
          value={String(findMaster(productItems, product)?.id ?? "")}
          onChange={setProduct}
          optional
          disabled={create.isPending}
          items={productItems.map((item) => ({
            id: String(item.id),
            name: `${item.nombre} · ${item.id_empresa ? "Empresa" : "Global"}`,
          }))}
        />
        <CatalogSelect
          label="Método de muestreo"
          value={String(findMaster(methodItems, method)?.id ?? "")}
          onChange={setMethod}
          disabled={create.isPending}
          items={methodItems.map((item) => ({
            id: String(item.id),
            name: `${item.nombre} · ${item.id_empresa ? "Empresa" : "Global"}`,
          }))}
        />
        {source &&
        (!findMaster(methodItems, method) || (product && !findMaster(productItems, product))) ? (
          <InlineNotice
            status="warning"
            title="Revisa los maestros de la versión anterior"
            description="Selecciona un producto y un método que sigan habilitados para tu empresa."
          />
        ) : null}
        <TextField isRequired name="criterio_muestra" defaultValue={source?.criterio_muestra ?? ""}>
          <Label>Criterio de muestra</Label>
          <TextArea
            rows={4}
            maxLength={1500}
            placeholder="Describe cómo obtener una muestra representativa."
          />
        </TextField>
        <TextField isRequired name="seleccion_frutos" defaultValue={source?.seleccion_frutos ?? ""}>
          <Label>Instrucciones de selección de frutos</Label>
          <TextArea rows={4} maxLength={1500} />
        </TextField>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="tamano_recomendado"
            type="number"
            defaultValue={String(source?.tamano_recomendado ?? "")}
          >
            <Label>Tamaño recomendado</Label>
            <Input min={1} max={100000} step={1} />
          </TextField>
          <TextField
            isRequired
            name="max_frutos"
            type="number"
            defaultValue={String(source?.max_frutos ?? "")}
          >
            <Label>Máximo de frutos</Label>
            <Input min={1} max={100000} step={1} />
          </TextField>
        </div>
        <Checkbox isSelected={population} onChange={setPopulation} isDisabled={create.isPending}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>Requiere documentar la población estimada</Label>
          </Checkbox.Content>
        </Checkbox>
      </fieldset>
      {error || create.error ? <FormNotice message={error || create.error?.message} /> : null}
      <Button
        type="submit"
        variant="primary"
        isDisabled={
          create.isPending ||
          !findMaster(methodItems, method) ||
          Boolean(product && !findMaster(productItems, product))
        }
      >
        {create.isPending ? "Guardando…" : source ? "Crear nueva versión" : "Crear procedimiento"}
      </Button>
    </form>
  );
}
