"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Chip, Input, Label, TextField, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiCopy } from "react-icons/fi";
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
import { useAllSamplingProcedures } from "@/features/samplings/hooks";
import { useAgriculturalSettingsAccess } from "../hooks";
import { toggleProcedure } from "../api";
import type { Procedure } from "../schema";
import { ProcedureForm } from "./procedure-form";
import { CatalogSelect } from "./catalog-select";

const base = "/settings/sampling-procedures";

export function ProcedureManager({
  initialCreate = false,
  id,
}: {
  initialCreate?: boolean;
  id?: string;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const { canReadProcedures, canWrite } = useAgriculturalSettingsAccess();
  const query = useAllSamplingProcedures(canReadProcedures);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [product, setProduct] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(initialCreate);
  const [source, setSource] = useState<Procedure>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Procedure | null>(null);
  const toggle = useMutation({
    mutationFn: (item: Procedure) => toggleProcedure(item.id, !item.activo),
    retry: false,
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ["agricultural", "sampling-procedures"] });
      setConfirm(null);
      toast.success("Disponibilidad actualizada");
    },
  });
  const all = query.data?.data ?? [];
  const detail = all.find((item) => String(item.id) === id);
  const rows = all.filter(
    (item) =>
      [item.nombre, item.version, item.producto, item.metodo]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(search.trim().toLocaleLowerCase("es")) &&
      (status === "all" || item.activo === (status === "active")) &&
      (!product || (product === "__general" ? !item.producto : item.producto === product)),
  );
  const last = Math.max(1, Math.ceil(rows.length / 12));
  const current = Math.min(page, last);
  function closeCreate(next: boolean) {
    setCreating(next);
    if (!next) {
      setSource(undefined);
      if (initialCreate) router.replace(base);
    }
  }
  return (
    <section className="space-y-6">
      <PageHeader
        title="Procedimientos de muestreo"
        description="Gestiona las instrucciones y versiones autorizadas para el muestreo de tu empresa."
        actions={
          canWrite ? (
            <Button
              variant="primary"
              onPress={() => {
                setSource(undefined);
                setCreating(true);
              }}
            >
              <FiPlus aria-hidden="true" /> Nuevo procedimiento
            </Button>
          ) : undefined
        }
      />
      {query.isPending ? (
        <LoadingState label="Cargando procedimientos" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Registrados", all.length],
              ["Activos", all.filter((item) => item.activo).length],
              ["Inactivos", all.filter((item) => !item.activo).length],
            ].map(([label, count]) => (
              <div key={label} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p>
              </div>
            ))}
          </div>
          <div className="grid items-end gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <TextField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            >
              <Label>Buscar procedimiento</Label>
              <Input placeholder="Nombre, versión, producto o método" />
            </TextField>
            <CatalogSelect
              label="Estado"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              items={[
                { id: "all", name: "Todos" },
                { id: "active", name: "Activos" },
                { id: "inactive", name: "Inactivos" },
              ]}
            />
            <CatalogSelect
              label="Producto"
              value={product}
              onChange={(value) => {
                setProduct(value);
                setPage(1);
              }}
              optional
              emptyLabel="Todos"
              items={[
                { id: "__general", name: "Sin producto específico" },
                ...Array.from(
                  new Set(
                    all
                      .map((item) => item.producto)
                      .filter((value): value is string => Boolean(value)),
                  ),
                ).map((value) => ({ id: value, name: value })),
              ]}
            />
          </div>
          {!rows.length ? (
            <EmptyState
              title="No hay procedimientos"
              description={
                all.length
                  ? "Prueba otros filtros."
                  : "Crea el primer procedimiento para habilitar el muestreo de tus lotes."
              }
            />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {rows.slice((current - 1) * 12, current * 12).map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={base + "/" + item.id}
                          className="break-words text-base font-semibold hover:text-accent"
                        >
                          {item.nombre}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {item.producto || "Todos los productos"} · v{item.version}
                        </p>
                      </div>
                      <Chip size="sm" variant="soft" color={item.activo ? "success" : "default"}>
                        {item.activo ? "Activo" : "Inactivo"}
                      </Chip>
                    </div>
                    <p className="text-sm text-muted">
                      {item.metodo} · Máximo {item.max_frutos} frutos
                    </p>
                    <p className="line-clamp-2 text-sm leading-relaxed">{item.criterio_muestra}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link
                        href={base + "/" + item.id}
                        className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                      >
                        Ver procedimiento
                      </Link>
                      {canWrite ? (
                        <Button
                          size="sm"
                          variant="tertiary"
                          onPress={() => {
                            toggle.reset();
                            setConfirm(item);
                          }}
                        >
                          {item.activo ? "Desactivar" : "Activar"}
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
              <PagePagination page={current} last={last} onChange={setPage} />
            </>
          )}
        </>
      )}
      <CreationDrawer
        open={creating && canWrite}
        onOpenChange={closeCreate}
        busy={busy}
        title={source ? "Nueva versión" : "Nuevo procedimiento"}
        description="Define las instrucciones y límites que aplicarán los inspectores."
        trigger={null}
      >
        <ProcedureForm
          source={source}
          onBusyChange={setBusy}
          onSaved={() => {
            setPage(1);
            closeCreate(false);
          }}
        />
      </CreationDrawer>
      <CreationDrawer
        open={Boolean(id) && !creating}
        onOpenChange={(next) => {
          if (!next) router.push(base);
        }}
        title="Detalle del procedimiento"
        description="Consulta la versión autorizada y sus instrucciones."
        trigger={null}
        closeLabel="Volver al listado"
      >
        {query.isPending ? (
          <LoadingState label="Cargando procedimiento" />
        ) : query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : !detail ? (
          <EmptyState
            title="Procedimiento no encontrado"
            description="No está disponible en tu empresa."
          />
        ) : (
          <div className="space-y-5">
            <div>
              <Chip size="sm" variant="soft" color={detail.activo ? "success" : "default"}>
                {detail.activo ? "Activo" : "Inactivo"}
              </Chip>
              <h2 className="mt-3 break-words text-xl font-semibold">{detail.nombre}</h2>
              <p className="mt-1 text-sm text-muted">
                {detail.producto || "Todos los productos"} · v{detail.version}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-default p-4 text-sm">
              {[
                ["Método", detail.metodo],
                ["Tamaño recomendado", detail.tamano_recomendado ?? "No definido"],
                ["Máximo de frutos", detail.max_frutos],
                ["Requiere población", detail.requiere_poblacion ? "Sí" : "No"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="font-semibold">Criterio de muestra</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {detail.criterio_muestra}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Selección de frutos</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {detail.seleccion_frutos}
              </p>
            </div>
            {canWrite ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onPress={() => {
                    setSource(detail);
                    setCreating(true);
                  }}
                >
                  <FiCopy aria-hidden="true" /> Nueva versión
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => {
                    toggle.reset();
                    setConfirm(detail);
                  }}
                >
                  {detail.activo ? "Desactivar" : "Activar"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </CreationDrawer>
      <CreationDrawer
        open={Boolean(confirm)}
        onOpenChange={(next) => {
          if (!next) setConfirm(null);
        }}
        busy={toggle.isPending}
        title={confirm?.activo ? "Desactivar procedimiento" : "Activar procedimiento"}
        description="Este cambio afecta a los nuevos muestreos de tu empresa."
        trigger={null}
      >
        <p className="mb-5 text-sm">
          {confirm?.nombre} · v{confirm?.version}
        </p>
        <InlineNotice
          status="accent"
          title="Muestreos existentes"
          description="Los muestreos ya registrados conservarán su procedimiento y versión."
        />
        {toggle.error ? <FormNotice message={toggle.error.message} /> : null}
        <Button
          className="mt-5"
          variant={confirm?.activo ? "danger" : "primary"}
          isDisabled={toggle.isPending}
          onPress={() => {
            if (confirm) toggle.mutate(confirm);
          }}
        >
          {toggle.isPending ? "Guardando…" : "Confirmar cambio"}
        </Button>
      </CreationDrawer>
    </section>
  );
}
