"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
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
      await cache.invalidateQueries({ queryKey: ["agricultural", "catalog"] });
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
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <label>
        Nombre
        <input
          name="nombre"
          defaultValue={name}
          required
          maxLength={150}
          disabled={save.isPending}
          className="ml-2 min-h-10 rounded-xl border border-border bg-surface px-3"
        />
      </label>
      <Button type="submit" isPending={save.isPending}>
        Guardar
      </Button>
      <Button isDisabled={save.isPending} onPress={() => setOpen(false)}>
        Cancelar
      </Button>
      {save.isError ? <FormNotice message={save.error.message} /> : null}
    </form>
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
