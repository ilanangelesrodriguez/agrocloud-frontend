"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Button, Chip, Input, Label, TextField, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  InlineNotice,
  LoadingState,
  PageHeader,
  PagePagination,
} from "@agrocloud/ui";
import { CreationDrawer } from "@/components/creation-drawer";
import { catalogInput, catalogLabels } from "../schema";
import type { CatalogItem, CatalogType } from "../schema";
import { createCatalog, toggleCatalog } from "../api";
import { useAgriculturalSettingsAccess, useMasterCatalog } from "../hooks";
import { CatalogSelect } from "./catalog-select";

export function CatalogOverview() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Maestros agrícolas"
        description="Organiza los valores que utiliza tu empresa en lotes, muestreos e inspecciones."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(catalogLabels).map(([type, label]) => (
          <Link
            key={type}
            href={"/settings/catalogs/" + type}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
          >
            <div>
              <h2 className="font-semibold">{label}</h2>
              <p className="mt-1 text-sm text-muted">
                {type === "unidad"
                  ? "Consultar unidades disponibles"
                  : "Valores y disponibilidad de tu empresa"}
              </p>
            </div>
            <FiArrowRight aria-hidden="true" className="size-5 shrink-0 text-accent" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CatalogManager({ type }: { type: CatalogType }) {
  const { canRead, canWrite } = useAgriculturalSettingsAccess();
  const query = useMasterCatalog(type, canRead);
  const products = useMasterCatalog("producto", canRead && type === "variedad");
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [parent, setParent] = useState("");
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState<CatalogItem[]>([]);
  const [confirm, setConfirm] = useState<CatalogItem | null>(null);
  const refresh = () => cache.invalidateQueries({ queryKey: ["agricultural", "catalog"] });
  const create = useMutation({
    mutationFn: createCatalog,
    retry: false,
    onSuccess: async () => {
      await refresh();
      setOpen(false);
      toast.success("Valor maestro registrado");
    },
  });
  const toggle = useMutation({
    mutationFn: ({ item, active }: { item: CatalogItem; active: boolean }) =>
      toggleCatalog(item.id, active),
    retry: false,
    onSuccess: async (_, { item, active }) => {
      setDisabled((previous) =>
        active
          ? previous.filter((entry) => entry.id !== item.id)
          : [...previous.filter((entry) => entry.id !== item.id), item],
      );
      await refresh();
      setConfirm(null);
      toast.success(active ? "Valor habilitado" : "Valor deshabilitado para tu empresa");
    },
  });
  const active = query.data?.data ?? [];
  const rows = [
    ...active,
    ...disabled.filter((item) => !active.some((entry) => entry.id === item.id)),
  ].filter((item) =>
    item.nombre.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es")),
  );
  const last = Math.max(1, Math.ceil(rows.length / 12));
  const current = Math.min(page, last);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending || type === "unidad") return;
    const fields = new FormData(event.currentTarget);
    const parsed = catalogInput.safeParse({
      tipo: type,
      nombre: fields.get("nombre"),
      parent_id: type === "variedad" ? Number(parent) : null,
    });
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    if (parsed.success) create.mutate(parsed.data);
  }
  return (
    <section className="space-y-6">
      <PageHeader
        title={catalogLabels[type]}
        description="Catálogo disponible para tu empresa. Los valores globales se comparten; su disponibilidad se configura por empresa."
        actions={
          canWrite && type !== "unidad" ? (
            <CreationDrawer
              open={open}
              onOpenChange={setOpen}
              busy={create.isPending}
              title="Nuevo valor maestro"
              description={catalogLabels[type]}
              trigger={
                <Button
                  variant="primary"
                  onPress={() => {
                    setParent("");
                    setError("");
                    create.reset();
                    setOpen(true);
                  }}
                >
                  <FiPlus aria-hidden="true" /> Nuevo valor
                </Button>
              }
            >
              <form onSubmit={submit} className="space-y-5">
                <TextField isRequired name="nombre" isDisabled={create.isPending}>
                  <Label>Nombre</Label>
                  <Input maxLength={150} />
                </TextField>
                {type === "variedad" ? (
                  products.isPending ? (
                    <LoadingState label="Cargando productos" />
                  ) : products.isError ? (
                    <ErrorState error={products.error} retry={() => void products.refetch()} />
                  ) : (
                    <>
                      <CatalogSelect
                        label="Producto"
                        value={parent}
                        onChange={setParent}
                        disabled={create.isPending}
                        items={(products.data?.data ?? []).map((item) => ({
                          id: String(item.id),
                          name: item.nombre,
                        }))}
                      />
                      {!products.data?.data.length ? (
                        <InlineNotice
                          status="warning"
                          title="Registra un producto primero"
                          description="Las variedades deben pertenecer a un producto habilitado."
                        />
                      ) : null}
                    </>
                  )
                ) : null}
                {error || create.error ? (
                  <FormNotice message={error || create.error?.message} />
                ) : null}
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={create.isPending || (type === "variedad" && !parent)}
                >
                  {create.isPending ? "Guardando…" : "Guardar valor"}
                </Button>
              </form>
            </CreationDrawer>
          ) : undefined
        }
      />
      <InlineNotice
        status="accent"
        title={type === "unidad" ? "Unidades de consulta" : "Disponibilidad del catálogo"}
        description={
          type === "unidad"
            ? "Las unidades están predefinidas. Puedes configurar su disponibilidad, pero no crear nuevas unidades. Los valores deshabilitados solo permanecen visibles mientras mantengas abierta esta vista."
            : "Aquí se muestran los valores habilitados. Puedes recuperar los que deshabilites mientras mantengas abierta esta vista; al salir, ya no aparecerán en el listado."
        }
      />
      <TextField
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      >
        <Label>Buscar valor</Label>
        <Input placeholder="Buscar por nombre" />
      </TextField>
      {toggle.error && !confirm ? <FormNotice message={toggle.error.message} /> : null}
      {query.isPending ? (
        <LoadingState label="Cargando catálogo" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : !rows.length ? (
        <EmptyState
          title="No hay valores disponibles"
          description="Prueba otra búsqueda o registra un valor para tu empresa."
        />
      ) : (
        <>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {rows.slice((current - 1) * 12, current * 12).map((item) => {
              const enabled = active.some((entry) => entry.id === item.id);
              const product = products.data?.data.find((entry) => entry.id === item.parent_id);
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold">{item.nombre}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {item.id_empresa ? "Personalizado por tu empresa" : "Catálogo global"}
                      {product ? " · " + product.nombre : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip size="sm" color={enabled ? "success" : "default"} variant="soft">
                      {enabled ? "Habilitado" : "Deshabilitado"}
                    </Chip>
                    {canWrite ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        isDisabled={toggle.isPending}
                        onPress={() => {
                          toggle.reset();
                          if (enabled) setConfirm(item);
                          else toggle.mutate({ item, active: true });
                        }}
                      >
                        {enabled ? "Deshabilitar" : "Habilitar"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <PagePagination page={current} last={last} onChange={setPage} />
        </>
      )}
      <CreationDrawer
        open={Boolean(confirm)}
        onOpenChange={(next) => {
          if (!next) setConfirm(null);
        }}
        busy={toggle.isPending}
        title="Deshabilitar valor"
        description="Este cambio afecta únicamente a tu empresa."
        trigger={null}
      >
        <p className="mb-5 text-sm">
          ¿Deshabilitar «{confirm?.nombre}»? Dejará de estar disponible en los formularios. Los
          registros existentes conservarán su valor.
        </p>
        {toggle.error ? <FormNotice message={toggle.error.message} /> : null}
        <Button
          variant="danger"
          isDisabled={toggle.isPending}
          onPress={() => {
            if (confirm) toggle.mutate({ item: confirm, active: false });
          }}
        >
          {toggle.isPending ? "Guardando…" : "Deshabilitar"}
        </Button>
      </CreationDrawer>
    </section>
  );
}
