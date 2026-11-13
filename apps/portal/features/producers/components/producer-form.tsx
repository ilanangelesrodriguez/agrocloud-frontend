"use client";

import type { FormEvent } from "react";
import type { Producer } from "../schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { RecordField } from "@/features/agricultural/shared/record-field";
import { producerInput } from "../schema";
import { saveProducer } from "../api";

const producerFields = [
  ["ruc", "RUC", 11],
  ["nombre_razon_social", "Razón social", 200],
  ["fundo", "Fundo", 200],
  ["ubicacion", "Ubicación", 250],
  ["departamento", "Departamento", 100],
  ["provincia", "Provincia", 100],
  ["distrito", "Distrito", 100],
  ["ubigeo", "Ubigeo", 6],
] as const;

export function ProducerForm({ producer, canRead }: { producer?: Producer; canRead: boolean }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: (input: object) => saveProducer(producer?.id_productor, input),
    onSuccess: ({ data }) => {
      void cache.invalidateQueries({ queryKey: ["agricultural", "producers"] });
      router.push(canRead ? "/producers/" + data.id_productor : "/dashboard");
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const values = new FormData(event.currentTarget);
    const input = producerInput.safeParse(
      Object.fromEntries(
        producerFields.map(([key]) => [key, String(values.get(key) ?? "").trim() || null]),
      ),
    );

    setError(input.success ? "" : (input.error.issues[0]?.message ?? "Revisa los datos."));
    if (input.success) save.mutate(input.data);
  }

  return (
    <form className="space-y-4 rounded-card border border-border bg-surface p-5" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">
          {producer ? "Editar productor" : "Registrar productor"}
        </legend>
        {producerFields.map(([name, label, max]) => (
          <RecordField
            key={name}
            initial={producer?.[name]}
            label={label}
            maxLength={max}
            name={name}
            required={name === "ruc" || name === "nombre_razon_social"}
          />
        ))}
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">
        {save.isPending ? "Guardando…" : "Guardar productor"}
      </Button>
    </form>
  );
}
