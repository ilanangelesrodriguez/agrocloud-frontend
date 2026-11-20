"use client";

import { DateInput } from "@/components/date-input";
import type { FormEvent } from "react";
import type { Lot } from "@/features/lots/schema";
import { useState } from "react";
import { Button, Input, Label, ListBox, Select, TextArea, TextField } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { receptionDocuments, receptionInput } from "../schema";
import { useReceptionMutation } from "../hooks";

export function ReceptionForm({ lot }: { lot: Lot }) {
  const [documentType, setDocumentType] = useState<string>(receptionDocuments[0]);
  const [error, setError] = useState("");
  const save = useReceptionMutation(lot);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const text = (name: string) => String(fields.get(name) ?? "").trim();
    const date = new Date(text("recibido_en"));
    const weight = Number(text("peso_recibido_kg"));
    const notes = text("observaciones");

    if (date.getTime() > Date.now()) {
      setError("La recepción no puede tener una fecha futura.");

      return;
    }
    if (
      weight > 0 &&
      Math.round(weight * 100) !== Math.round(Number(lot.peso_kg) * 100) &&
      !notes
    ) {
      setError("Explica la diferencia de peso en las observaciones.");

      return;
    }
    const result = receptionInput.safeParse({
      tipo_documento: documentType,
      documento: text("documento"),
      transportista: text("transportista") || null,
      placa: text("placa") || null,
      peso_recibido_kg: weight,
      recibido_en: Number.isFinite(date.getTime()) ? date.toISOString() : "",
      observaciones: notes || null,
    });

    setError(
      result.success ? "" : (result.error.issues[0]?.message ?? "Revisa los datos de recepción."),
    );
    if (result.success) save.mutate(result.data);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Registrar recepción</legend>
        <Select
          isDisabled={save.isPending}
          value={documentType}
          onChange={(value) => {
            if (typeof value === "string") setDocumentType(value);
          }}
        >
          <Label>Tipo de documento</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Tipos de documento">
              {receptionDocuments.map((value) => (
                <ListBox.Item key={value} id={value} textValue={value}>
                  {value}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {[
          ["documento", "Número de documento", 100],
          ["transportista", "Transportista", 150],
          ["placa", "Placa", 20],
        ].map(([name, label, max]) => (
          <TextField key={name} isRequired={name === "documento"} name={String(name)}>
            <Label>{label}</Label>
            <Input maxLength={Number(max)} />
          </TextField>
        ))}
        <TextField isRequired name="peso_recibido_kg" type="number">
          <Label>Peso recibido (kg)</Label>
          <Input max={99999999.99} min={0.01} step="0.01" />
        </TextField>
        <DateInput
          required
          withTime
          disabled={save.isPending}
          name="recibido_en"
          label="Fecha y hora de recepción (hora local)"
        />
        <p className="text-xs text-muted sm:col-span-2">
          Si el peso recibido difiere del peso registrado en el lote, explica el motivo en
          observaciones.
        </p>
        <TextField className="sm:col-span-2" name="observaciones">
          <Label>Observaciones</Label>
          <TextArea className="w-full" maxLength={3000} rows={3} />
        </TextField>
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">
        {save.isPending ? "Guardando…" : "Registrar recepción"}
      </Button>
    </form>
  );
}
