"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";
import type { FormEvent } from "react";
import type { Producer } from "../schema";
import { useRef, useState } from "react";
import { usePanelBusy } from "@/components/route-drawer";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label, TextField, toast, FieldError, Form } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { RecordField } from "@/features/agricultural/shared/record-field";
import { LocationFields } from "@/features/geo/location-fields";
import { producerInput } from "../schema";
import { saveProducer, lookupProducerRuc } from "../api";

const fields = [
  "ruc",
  "nombre_razon_social",
  "fundo",
  "ubicacion",
  "departamento",
  "provincia",
  "distrito",
  "ubigeo",
] as const;

export function ProducerForm({
  producer,
  canRead,
  onSaved,
  onBusyChange,
}: {
  producer?: Producer;
  canRead: boolean;
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
  const [ruc, setRuc] = useState(producer?.ruc ?? "");
  const [businessName, setBusinessName] = useState(producer?.nombre_razon_social ?? "");
  const rucRef = useRef(ruc);
  const nameRef = useRef(businessName);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lookupFeedback, setLookupFeedback] = useState("");
  const lookup = useMutation({ mutationFn: lookupProducerRuc, retry: false });
  const save = useMutation({
    mutationFn: (input: object) => saveProducer(producer?.id_productor, input),
    onMutate: () => reportBusy(true),
    onSettled: () => reportBusy(false),
    onSuccess: ({ data }) => {
      toast.success("Productor guardado");
      void invalidateOperationalQueries(cache);
      if (onSaved) onSaved();
      else router.push(canRead ? "/producers/" + data.id_productor : "/dashboard");
    },
    retry: false,
  });

  async function consultRuc() {
    if (!/^\d{11}$/.test(ruc) || lookup.isPending) {
      setLookupFeedback("Ingresa un RUC de 11 dígitos.");
      return;
    }
    const requested = ruc;
    const previous = businessName;
    setLookupFeedback("");
    try {
      const result = await lookup.mutateAsync(requested);
      // Never overwrite a user correction made while the request was processing.
      if (requested !== rucRef.current) return;
      if (result.resultado === "verificado" && result.razon_social) {
        if (nameRef.current === previous) {
          nameRef.current = result.razon_social;
          setBusinessName(result.razon_social);
        }
        setLookupFeedback("RUC verificado. Revisa la razón social antes de guardar.");
      } else
        setLookupFeedback(
          "RUC no encontrado o consulta no disponible. Puedes completar la razón social manualmente.",
        );
    } catch (e) {
      setLookupFeedback(e instanceof Error ? e.message : "No se pudo verificar el RUC.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const values = new FormData(event.currentTarget);
    const input = producerInput.safeParse(
      Object.fromEntries(fields.map((key) => [key, String(values.get(key) ?? "").trim() || null])),
    );
    setError(input.success ? "" : (input.error.issues[0]?.message ?? "Revisa los datos."));
    setFieldErrors(
      input.success
        ? {}
        : Object.fromEntries(
            input.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
          ),
    );
    if (input.success) save.mutate(input.data);
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
        <legend className="mb-3 font-semibold">
          {onSaved ? "Datos del productor" : producer ? "Editar productor" : "Registrar productor"}
        </legend>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              variant="secondary"
              isRequired
              isInvalid={Boolean(fieldErrors.ruc)}
              name="ruc"
            >
              <Label>RUC</Label>
              <Input
                placeholder="Ej. 20123456789"
                variant="secondary"
                value={ruc}
                maxLength={11}
                inputMode="numeric"
                onChange={(event) => {
                  rucRef.current = event.target.value;
                  setRuc(event.target.value);
                  setLookupFeedback("");
                }}
              />
              <FieldError />
            </TextField>
          </div>
          <Button
            type="button"
            variant="secondary"
            isDisabled={lookup.isPending}
            onPress={() => void consultRuc()}
          >
            {lookup.isPending ? "Consultando…" : "Consultar RUC"}
          </Button>
        </div>
        <TextField
          variant="secondary"
          isRequired
          isInvalid={Boolean(fieldErrors.nombre_razon_social)}
          name="nombre_razon_social"
        >
          <Label>Razón social</Label>
          <Input
            placeholder="Ej. Productor del Valle S.A.C."
            variant="secondary"
            value={businessName}
            maxLength={200}
            onChange={(event) => {
              nameRef.current = event.target.value;
              setBusinessName(event.target.value);
            }}
          />
          <FieldError />
        </TextField>
        {lookupFeedback ? (
          <p role="status" className="text-sm text-muted sm:col-span-2">
            {lookupFeedback}
          </p>
        ) : null}
        <RecordField
          initial={producer?.fundo}
          error={fieldErrors.fundo}
          label="Fundo"
          maxLength={200}
          name="fundo"
        />
        <RecordField
          initial={producer?.ubicacion}
          error={fieldErrors.ubicacion}
          label="Dirección o referencia del fundo"
          maxLength={250}
          name="ubicacion"
        />
        <LocationFields
          errors={fieldErrors}
          onChange={() => setFieldErrors({})}
          initial={producer}
          disabled={save.isPending}
        />
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">
        {save.isPending ? "Guardando…" : "Guardar productor"}
      </Button>
    </Form>
  );
}
