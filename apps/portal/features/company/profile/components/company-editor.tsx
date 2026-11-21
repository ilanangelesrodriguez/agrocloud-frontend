"use client";
import { fieldErrorsFrom, fieldPlaceholder } from "@/lib/form-fields";

import type { FormEvent } from "react";
import type { z } from "zod";
import { FiSave } from "react-icons/fi";
import { useState } from "react";
import { Button, Input, Label, TextField, toast, FieldError, Form } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocationFields } from "@/features/geo/location-fields";
import { companyResponseSchema, editCompanySchema } from "../schema";
import { updateCompanyProfile } from "../api";

const editableFields = [
  ["razon_social", "Razón social", 200],
  ["nombre_comercial", "Nombre comercial", 150],
  ["tipo_empresa", "Tipo de empresa", 80],
  ["direccion", "Dirección", 250],
  ["correo", "Correo", 255],
  ["telefono", "Teléfono", 30],
] as const;
const locationKeys = ["departamento", "provincia", "distrito", "ubigeo"] as const;

export function CompanyEditor({
  profile,
  close,
  onBusyChange,
}: {
  profile: z.infer<typeof companyResponseSchema>["data"];
  close: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const update = useMutation({
    mutationFn: (input: z.infer<typeof editCompanySchema>) => updateCompanyProfile(input),
    onMutate: () => onBusyChange?.(true),
    onSettled: () => onBusyChange?.(false),
    onSuccess: (result) => {
      cache.setQueryData(["company", "profile"], result);
      toast.success("Datos de la empresa actualizados");
      close();
    },
    retry: false,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (update.isPending) return;
    const form = new FormData(event.currentTarget);
    const changes = [...editableFields.map(([name]) => name), ...locationKeys].flatMap((name) => {
      const value = String(form.get(name) ?? "").trim();
      return value === (profile[name] ?? "") ? [] : [[name, value || null]];
    });
    const parsed = editCompanySchema.safeParse(Object.fromEntries(changes));
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    setFieldErrors(parsed.success ? {} : fieldErrorsFrom(parsed.error.issues));
    if (parsed.success) update.mutate(parsed.data);
  }
  return (
    <Form
      validationErrors={fieldErrors}
      validationBehavior="native"
      className="space-y-4 rounded-card border border-border bg-surface p-5"
      onSubmit={submit}
    >
      <fieldset
        onInputCapture={() => setFieldErrors({})}
        className="grid gap-4 sm:grid-cols-2"
        disabled={update.isPending}
      >
        <legend className="mb-3 font-semibold">Editar datos de la empresa</legend>
        {editableFields.map(([name, label, max]) => (
          <TextField
            variant="secondary"
            key={name}
            defaultValue={profile[name] ?? ""}
            isRequired={name === "razon_social" || name === "nombre_comercial"}
            name={name}
            type={name === "correo" ? "email" : name === "telefono" ? "tel" : "text"}
          >
            <Label>{label}</Label>
            <Input
              placeholder={fieldPlaceholder(name, label)}
              variant="secondary"
              className="w-full"
              maxLength={max}
            />
            <FieldError />
          </TextField>
        ))}
        <LocationFields
          errors={fieldErrors}
          onChange={() => setFieldErrors({})}
          initial={profile}
          disabled={update.isPending}
        />
      </fieldset>
      {error || update.error ? <FormNotice message={error || update.error?.message} /> : null}
      <Button isDisabled={update.isPending} type="submit" variant="primary">
        <FiSave aria-hidden="true" /> {update.isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </Form>
  );
}
