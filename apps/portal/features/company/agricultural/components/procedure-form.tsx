"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Label,
  TextArea,
  TextField,
  toast,
  FieldError,
  Form,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorState, FormNotice, InlineNotice, LoadingState } from "@agrocloud/ui";
import { createProcedure } from "../api";
import { useMasterCatalog } from "../hooks";
import { procedureInput } from "../schema";
import type { Procedure, CatalogItem } from "../schema";
import { versionLabel } from "../procedure-display";
import { fieldErrorsFrom } from "@/lib/form-fields";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [maximum, setMaximum] = useState(String(source?.max_frutos ?? ""));
  const [recommendedSize, setRecommendedSize] = useState(String(source?.tamano_recomendado ?? ""));
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
      nombre: String(fields.get("nombre") ?? "").trim(),
      version: String(fields.get("version") ?? "")
        .trim()
        .replace(/^(?:v\s*)+(?=\d)/i, ""),
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
      parsed.data.nombre.toLocaleLowerCase("es") === source.nombre.trim().toLocaleLowerCase("es") &&
      versionLabel(parsed.data.version) === versionLabel(source.version)
    ) {
      setError("Usa una versión diferente a la del procedimiento original.");
      return;
    }
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    setFieldErrors(parsed.success ? {} : fieldErrorsFrom(parsed.error.issues));
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
    <Form
      validationErrors={fieldErrors}
      validationBehavior="native"
      onSubmit={submit}
      className="space-y-5"
    >
      {source ? (
        <InlineNotice
          status="accent"
          title={"Basado en " + source.nombre + " · " + versionLabel(source.version)}
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
      <fieldset
        disabled={create.isPending}
        className="grid gap-5"
        onChange={() => {
          setFieldErrors((previous) => (Object.keys(previous).length ? {} : previous));
          setError("");
        }}
      >
        <TextField variant="secondary" isRequired name="nombre" defaultValue={source?.nombre ?? ""}>
          <Label>Nombre del procedimiento</Label>
          <Input
            placeholder="Ej. Muestreo de palta para recepción"
            variant="secondary"
            maxLength={150}
          />
          <FieldError />
        </TextField>
        <TextField variant="secondary" isRequired name="version" defaultValue={source ? "" : "1.0"}>
          <Label>Versión</Label>
          <Input variant="secondary" maxLength={30} placeholder={source ? "Ej. 2.0" : "Ej. 1.0"} />
          <FieldError />
        </TextField>
        <p className="-mt-3 text-xs text-muted">
          Usa una versión como 1.0 o 2.1. El prefijo v se añade al mostrarla.
        </p>
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
        <TextField
          variant="secondary"
          isRequired
          name="criterio_muestra"
          defaultValue={source?.criterio_muestra ?? ""}
        >
          <Label>Criterio de muestra</Label>
          <TextArea
            variant="secondary"
            rows={4}
            maxLength={1500}
            placeholder="Ej. Distribuir la muestra entre distintos puntos del lote e indicar el criterio de representatividad."
            minLength={10}
          />
          <FieldError />
        </TextField>
        <TextField
          variant="secondary"
          isRequired
          name="seleccion_frutos"
          defaultValue={source?.seleccion_frutos ?? ""}
        >
          <Label>Instrucciones de selección de frutos</Label>
          <TextArea
            placeholder="Ej. Seleccionar frutos de diferentes cajas y posiciones sin elegir únicamente los visibles."
            minLength={10}
            variant="secondary"
            rows={4}
            maxLength={1500}
          />
          <FieldError />
        </TextField>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            variant="secondary"
            name="tamano_recomendado"
            type="number"
            value={recommendedSize}
            onChange={setRecommendedSize}
          >
            <Label>Tamaño recomendado</Label>
            <Input placeholder="Ej. 30" variant="secondary" min={1} max={100000} step={1} />
            <FieldError />
          </TextField>
          <TextField
            variant="secondary"
            isRequired
            name="max_frutos"
            type="number"
            value={maximum}
            onChange={setMaximum}
          >
            <Label>Máximo de frutos</Label>
            <Input placeholder="Ej. 60" variant="secondary" min={1} max={100000} step={1} />
            <FieldError />
          </TextField>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Define las cantidades según el protocolo autorizado. El tamaño recomendado no debe superar
          el máximo de frutos.
        </p>
        {Number(maximum) === 1 || (recommendedSize !== "" && Number(recommendedSize) === 1) ? (
          <InlineNotice
            status="warning"
            title="Revisa el tamaño de muestra"
            description="Se ha indicado un solo fruto. Confirma que esta cantidad corresponde al protocolo; AgroCloud no determina su representatividad."
          />
        ) : null}
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
    </Form>
  );
}
