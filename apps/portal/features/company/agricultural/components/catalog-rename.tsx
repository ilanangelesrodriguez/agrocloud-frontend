"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, TextField, Label, Input, FieldError, Form } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
import { catalogUpdated } from "../schema";
export function CatalogRename({ id, name }: { id: number; name: string }) {
  const [open, setOpen] = useState(false);
  const cache = useQueryClient();
  const save = useMutation({
    mutationFn: (nombre: string) =>
      bffRequest(
        `catalogs/${id}`,
        catalogUpdated,
        {
          method: "PUT",
          body: JSON.stringify({ nombre }),
          headers: { "Content-Type": "application/json" },
        },
        "agricultural",
      ),
    onSuccess: async () => {
      await invalidateOperationalQueries(cache);
      setOpen(false);
    },
    retry: false,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const nombre = String(new FormData(event.currentTarget).get("nombre") ?? "").trim();
    if (nombre) save.mutate(nombre);
  }
  return open ? (
    <Form
      validationBehavior="native"
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2"
    >
      <TextField variant="secondary" name="nombre" isRequired isDisabled={save.isPending}>
        <Label>Nombre</Label>
        <Input placeholder="Ej. María" variant="secondary" defaultValue={name} maxLength={150} />
        <FieldError />
      </TextField>
      <Button type="submit" isPending={save.isPending}>
        Guardar
      </Button>
      <Button isDisabled={save.isPending} onPress={() => setOpen(false)}>
        Cancelar
      </Button>
      {save.isError ? <FormNotice message={save.error.message} /> : null}
    </Form>
  ) : (
    <Button
      size="sm"
      onPress={() => {
        save.reset();
        setOpen(true);
      }}
    >
      Editar
    </Button>
  );
}
